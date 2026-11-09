/* Geração local de arquivos: PDF (A4), CSV e XLSX sem dependências externas. */

const TIPOS = {
  pdf: "application/pdf",
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function baixarArquivo(nome, conteudo, tipo = TIPOS.pdf) {
  const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function textoCsv(valor, separador) {
  const texto = valor == null ? "" : String(valor);
  return texto.includes(separador) || /["\r\n]/.test(texto)
    ? `"${texto.replace(/"/g, '""')}"`
    : texto;
}

// CSV compatível com o Excel em português (separador ";" e BOM UTF-8).
export function gerarCsv(colunas, linhas, separador = ";") {
  const cabecalho = colunas.map((coluna) => textoCsv(coluna.rotulo, separador)).join(separador);
  const corpo = linhas.map((linha) =>
    colunas.map((coluna) => textoCsv(linha[coluna.chave], separador)).join(separador),
  );
  const conteudo = [cabecalho, ...corpo].join("\r\n");
  return new Blob([String.fromCharCode(0xfeff) + conteudo + "\r\n"], {
    type: TIPOS.csv,
  });
}

/* ------------------------------- XLSX ------------------------------- */

const TABELA_CRC = (() => {
  const tabela = new Uint32Array(256);
  for (let numero = 0; numero < 256; numero += 1) {
    let valor = numero;
    for (let bit = 0; bit < 8; bit += 1) {
      valor = valor & 1 ? 0xedb88320 ^ (valor >>> 1) : valor >>> 1;
    }
    tabela[numero] = valor >>> 0;
  }
  return tabela;
})();

function crc32(bytes) {
  let valor = 0xffffffff;
  for (const byte of bytes) {
    valor = TABELA_CRC[(valor ^ byte) & 0xff] ^ (valor >>> 8);
  }
  return (valor ^ 0xffffffff) >>> 0;
}

const utf8 = (texto) => new TextEncoder().encode(texto);

function zip(arquivos) {
  const partes = [];
  const central = [];
  let deslocamento = 0;

  const u16 = (valor) => [valor & 0xff, (valor >>> 8) & 0xff];
  const u32 = (valor) => [
    valor & 0xff,
    (valor >>> 8) & 0xff,
    (valor >>> 16) & 0xff,
    (valor >>> 24) & 0xff,
  ];

  arquivos.forEach(([nome, conteudo]) => {
    const nomeBytes = utf8(nome);
    const bytes = typeof conteudo === "string" ? utf8(conteudo) : conteudo;
    const crc = crc32(bytes);
    const tamanho = bytes.length;

    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(0),
      ...u16(0x0021),
      ...u32(crc),
      ...u32(tamanho),
      ...u32(tamanho),
      ...u16(nomeBytes.length),
      ...u16(0),
      ...nomeBytes,
    ];

    partes.push(new Uint8Array(local), bytes);

    central.push([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(0),
      ...u16(0x0021),
      ...u32(crc),
      ...u32(tamanho),
      ...u32(tamanho),
      ...u16(nomeBytes.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(deslocamento),
      ...nomeBytes,
    ]);

    deslocamento += local.length + bytes.length;
  });

  const centralBytes = central.flat();
  const inicioCentral = deslocamento;
  const fim = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(arquivos.length),
    ...u16(arquivos.length),
    ...u32(centralBytes.length),
    ...u32(inicioCentral),
    ...u16(0),
  ];

  const total =
    partes.reduce((soma, parte) => soma + parte.length, 0) +
    centralBytes.length +
    fim.length;
  const saida = new Uint8Array(total);
  let posicao = 0;

  partes.forEach((parte) => {
    saida.set(parte, posicao);
    posicao += parte.length;
  });
  saida.set(centralBytes, posicao);
  posicao += centralBytes.length;
  saida.set(fim, posicao);

  return saida;
}

function colunaLetra(indice) {
  let numero = indice + 1;
  let letra = "";
  while (numero > 0) {
    const resto = (numero - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    numero = Math.floor((numero - 1) / 26);
  }
  return letra;
}

function escaparXml(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function celulaXlsx(valor, referencia, tipo) {
  if (tipo === "numero" && valor !== "" && valor != null && Number.isFinite(Number(valor))) {
    return `<c r="${referencia}"><v>${Number(valor)}</v></c>`;
  }
  return `<c r="${referencia}" t="inlineStr"><is><t xml:space="preserve">${escaparXml(
    valor ?? "",
  )}</t></is></c>`;
}

export function gerarXlsx(colunas, linhas, nomeAba = "Dados") {
  const cabecalho = colunas
    .map((coluna, indice) => celulaXlsx(coluna.rotulo, `${colunaLetra(indice)}1`, "texto"))
    .join("");
  const corpo = linhas
    .map((linha, indiceLinha) => {
      const numeroLinha = indiceLinha + 2;
      const celulas = colunas
        .map((coluna, indiceColuna) =>
          celulaXlsx(
            linha[coluna.chave],
            `${colunaLetra(indiceColuna)}${numeroLinha}`,
            coluna.tipo,
          ),
        )
        .join("");
      return `<row r="${numeroLinha}">${celulas}</row>`;
    })
    .join("");

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1">${cabecalho}</row>${corpo}</sheetData></worksheet>`;

  const arquivos = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escaparXml(
        nomeAba,
      )}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ],
    [
      "xl/styles.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`,
    ],
    ["xl/worksheets/sheet1.xml", sheet],
  ];

  return new Blob([zip(arquivos)], { type: TIPOS.xlsx });
}

/* -------------------------------- PDF -------------------------------- */

const A4 = { largura: 595.28, altura: 841.89 };
const MARGEM = 48;
const LARGURA_CONTEUDO = A4.largura - MARGEM * 2;
const RODAPE_Y = 58;

const ESPECIAIS = {
  "–": 0x96,
  "—": 0x97,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "…": 0x85,
  "•": 0x95,
  " ": 0x20,
};

function bytesPdf(texto) {
  const bytes = [];
  for (const caractere of String(texto ?? "")) {
    const codigo = caractere.codePointAt(0);
    if (ESPECIAIS[caractere] !== undefined) bytes.push(ESPECIAIS[caractere]);
    else if (codigo <= 0xff) bytes.push(codigo);
    else bytes.push(0x3f);
  }
  return bytes;
}

function escaparPdf(bytes) {
  let saida = "";
  for (const byte of bytes) {
    if (byte === 0x5c) saida += "\\\\";
    else if (byte === 0x28) saida += "\\(";
    else if (byte === 0x29) saida += "\\)";
    else if (byte < 32) saida += " ";
    else saida += String.fromCharCode(byte);
  }
  return saida;
}

function quebrarTexto(texto, tamanho, largura = LARGURA_CONTEUDO) {
  const palavras = String(texto ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!palavras.length) return [""];

  const limite = Math.max(24, Math.floor(largura / (tamanho * 0.5)));
  const linhas = [];
  let atual = "";

  palavras.forEach((palavra) => {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (tentativa.length > limite && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  });
  if (atual) linhas.push(atual);

  return linhas;
}

function opTexto(texto, fonte, tamanho, x, y) {
  return `BT /${fonte} ${tamanho} Tf ${x.toFixed(2)} ${y.toFixed(
    2,
  )} Td (${escaparPdf(bytesPdf(texto))}) Tj ET`;
}

function montarPaginas(documento) {
  const paginas = [];
  let pagina = null;
  let y = 0;

  function novaPagina() {
    pagina = [];
    paginas.push(pagina);
    const topo = A4.altura - 56;
    pagina.push(opTexto("KFKA · Acompanhamento escolar", "F2", 13, MARGEM, topo));
    if (documento.escola) {
      pagina.push(opTexto(documento.escola, "F1", 9, MARGEM, topo - 14));
    }
    pagina.push(
      `q 0.8 0.8 0.8 RG 0.6 w ${MARGEM} ${topo - 20} m ${(
        A4.largura - MARGEM
      ).toFixed(2)} ${topo - 20} l S Q`,
    );
    y = topo - 44;
  }

  function garantir(altura) {
    if (y - altura < RODAPE_Y + 12) novaPagina();
  }

  function escrever(texto, { fonte = "F1", tamanho = 10.5, antes = 0, depois = 0 } = {}) {
    const linhas = quebrarTexto(texto, tamanho);
    if (antes) {
      garantir(antes);
      y -= antes;
    }
    linhas.forEach((linha) => {
      garantir(tamanho + 4);
      y -= tamanho + 3;
      pagina.push(opTexto(linha, fonte, tamanho, MARGEM, y));
    });
    if (depois) y -= depois;
  }

  novaPagina();
  escrever(documento.titulo, { fonte: "F2", tamanho: 17, depois: 3 });
  if (documento.subtitulo) {
    escrever(documento.subtitulo, { tamanho: 9.5, depois: 8 });
  }

  (documento.cabecalho || []).forEach(([rotulo, valor]) => {
    escrever(`${rotulo}: ${valor ?? "—"}`, { tamanho: 10.5, depois: 2 });
  });

  (documento.secoes || []).forEach((secao) => {
    escrever(secao.titulo, { fonte: "F2", tamanho: 12, antes: 14, depois: 5 });
    (secao.itens || []).forEach(([rotulo, valor]) => {
      escrever(`${rotulo}: ${valor ?? "—"}`, { tamanho: 10.5, depois: 2 });
    });
    (secao.paragrafos || []).forEach((paragrafo) => {
      escrever(paragrafo, { tamanho: 10.5, depois: 7 });
    });
  });

  const gerado = new Date().toLocaleString("pt-BR");
  paginas.forEach((ops, indice) => {
    ops.push(
      `q 0.8 0.8 0.8 RG 0.6 w ${MARGEM} 52 m ${(A4.largura - MARGEM).toFixed(
        2,
      )} 52 l S Q`,
    );
    ops.push(opTexto(`Gerado pelo sistema KFKA em ${gerado}`, "F1", 8, MARGEM, 38));
    if (documento.rodape) {
      ops.push(opTexto(documento.rodape, "F1", 8, MARGEM, 27));
    }
    ops.push(
      opTexto(
        `Página ${indice + 1} de ${paginas.length}`,
        "F1",
        8,
        A4.largura - MARGEM - 66,
        38,
      ),
    );
  });

  return paginas;
}

export function gerarPdf(documento) {
  const paginas = montarPaginas(documento);
  const objetos = [];
  const idsPaginas = [];
  const idsConteudos = [];
  let proximo = 5;

  paginas.forEach(() => {
    idsPaginas.push(proximo);
    proximo += 1;
    idsConteudos.push(proximo);
    proximo += 1;
  });

  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${paginas.length} >>`;
  objetos[3] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objetos[4] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  paginas.forEach((ops, indice) => {
    const conteudo = ops.join("\n");
    objetos[idsConteudos[indice]] = `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`;
    objetos[idsPaginas[indice]] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.largura} ${A4.altura}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idsConteudos[indice]} 0 R >>`;
  });

  const totalObjetos = proximo - 1;
  let saida = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const deslocamentos = [];

  for (let id = 1; id <= totalObjetos; id += 1) {
    deslocamentos[id] = saida.length;
    saida += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }

  const inicioXref = saida.length;
  saida += `xref\n0 ${totalObjetos + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= totalObjetos; id += 1) {
    saida += `${String(deslocamentos[id]).padStart(10, "0")} 00000 n \n`;
  }
  saida += `trailer\n<< /Size ${totalObjetos + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;

  const bytes = new Uint8Array(saida.length);
  for (let indice = 0; indice < saida.length; indice += 1) {
    bytes[indice] = saida.charCodeAt(indice) & 0xff;
  }

  return new Blob([bytes], { type: TIPOS.pdf });
}
