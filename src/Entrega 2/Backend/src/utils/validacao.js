const ErroAplicacao = require("../errors/ErroAplicacao");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function dataValida(valor) {
    if (!DATA_ISO.test(valor)) return false;

    const [ano, mes, dia] = valor.split("-").map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));

    return (
        data.getUTCFullYear() === ano &&
        data.getUTCMonth() === mes - 1 &&
        data.getUTCDate() === dia
    );
}

function vazio(valor) {
    return valor === undefined || valor === null || valor === "";
}

function validarRegra(valor, regra) {
    if (vazio(valor)) {
        if (regra.obrigatorio) return "Preencha este campo.";
        return null;
    }

    if (regra.tipo === "texto") {
        if (typeof valor !== "string") return "Informe um texto válido.";
        const texto = valor.trim();
        if (regra.min && texto.length < regra.min) {
            return `Use pelo menos ${regra.min} caracteres.`;
        }
        if (regra.max && texto.length > regra.max) {
            return `Use no máximo ${regra.max} caracteres.`;
        }
        return null;
    }

    if (regra.tipo === "email") {
        if (typeof valor !== "string") return "Informe um e-mail válido.";
        const email = valor.trim();
        if (email.length > 254 || !EMAIL.test(email)) {
            return "Informe um e-mail válido, como nome@escola.edu.br.";
        }
        return null;
    }

    if (regra.tipo === "senha") {
        if (typeof valor !== "string") return "Informe uma senha válida.";
        if (valor.length < (regra.min || 8)) {
            return `Use pelo menos ${regra.min || 8} caracteres.`;
        }
        if (Buffer.byteLength(valor, "utf8") > 72) {
            return "A senha deve ter no máximo 72 bytes.";
        }
        return null;
    }

    if (regra.tipo === "data") {
        if (typeof valor !== "string" || !dataValida(valor.trim())) {
            return "Informe uma data válida no formato AAAA-MM-DD.";
        }
        return null;
    }

    if (regra.tipo === "hora") {
        if (typeof valor !== "string" || !HORA.test(valor.trim())) {
            return "Informe um horário válido no formato HH:MM.";
        }
        return null;
    }

    if (regra.tipo === "booleano") {
        if (
            typeof valor !== "boolean" &&
            valor !== "true" &&
            valor !== "false"
        ) {
            return "Informe true ou false.";
        }
        return null;
    }

    if (regra.tipo === "inteiro") {
        const numero = Number(valor);
        if (!Number.isInteger(numero) || numero <= 0) {
            return "Informe um número inteiro positivo.";
        }
        if (regra.min !== undefined && numero < regra.min) {
            return `O valor mínimo é ${regra.min}.`;
        }
        if (regra.max !== undefined && numero > regra.max) {
            return `O valor máximo é ${regra.max}.`;
        }
        return null;
    }

    if (regra.tipo === "numero") {
        const numero = Number(valor);
        if (!Number.isFinite(numero)) return "Informe um número válido.";
        if (regra.min !== undefined && numero < regra.min) {
            return `O valor mínimo é ${regra.min}.`;
        }
        if (regra.max !== undefined && numero > regra.max) {
            return `O valor máximo é ${regra.max}.`;
        }
        return null;
    }

    if (regra.tipo === "enum") {
        const permitidos = regra.valores.map((item) => String(item).toLowerCase());
        if (!permitidos.includes(String(valor).toLowerCase())) {
            return `Use um destes valores: ${regra.valores.join(", ")}.`;
        }
        return null;
    }

    return null;
}

function limpar(valor, regra) {
    if (vazio(valor)) return undefined;

    if (regra.tipo === "texto") return valor.trim().replace(/\s+/g, " ");
    if (regra.tipo === "email") return valor.trim().toLowerCase();
    if (regra.tipo === "senha") return valor;
    if (regra.tipo === "inteiro" || regra.tipo === "numero") return Number(valor);
    if (regra.tipo === "enum") return String(valor).toLowerCase();
    if (regra.tipo === "data") return valor.trim();
    if (regra.tipo === "hora") return valor.trim();
    if (regra.tipo === "booleano") {
        return valor === true || valor === "true";
    }

    return valor;
}

/**
 * Valida e normaliza apenas os campos declarados em `regras`.
 * Erros são acumulados e devolvidos juntos em `detalhes`.
 */
function validarCampos(dados, regras) {
    const entrada = dados && typeof dados === "object" ? dados : {};
    const erros = {};
    const limpos = {};

    for (const [campo, regra] of Object.entries(regras)) {
        const erro = validarRegra(entrada[campo], regra);

        if (erro) {
            erros[campo] = erro;
        } else if (!vazio(entrada[campo])) {
            limpos[campo] = limpar(entrada[campo], regra);
        }
    }

    if (Object.keys(erros).length > 0) {
        throw new ErroAplicacao(
            "dados_invalidos",
            "Verifique os campos informados.",
            422,
            erros
        );
    }

    return limpos;
}

function validarId(valor, campo = "id") {
    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw new ErroAplicacao(
            "parametro_invalido",
            `O parâmetro "${campo}" deve ser um número inteiro positivo.`,
            400,
            { [campo]: "Valor inválido." }
        );
    }

    return numero;
}

function validarStatus(valor, permitidos) {
    const status = String(valor || "").toUpperCase();

    if (!permitidos.includes(status)) {
        throw new ErroAplicacao(
            "status_invalido",
            `Status inválido. Use: ${permitidos.join(", ")}.`,
            422,
            { status: "Status não permitido." }
        );
    }

    return status;
}

module.exports = {
    validarCampos,
    validarId,
    validarStatus
};
