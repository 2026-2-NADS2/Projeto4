/*
 * O banco guarda o perfil em maiúsculas (ADMIN, PROFESSOR, RESPONSAVEL),
 * enquanto a API e o frontend usam os nomes em minúsculas
 * (administrador, professor, responsavel).
 *
 * Toda conversão entre os dois vocabulários deve passar por aqui.
 */

const PERFIS_API = [
    "administrador",
    "professor",
    "responsavel"
];

const PERFIL_PARA_BANCO = {
    administrador: "ADMIN",
    professor: "PROFESSOR",
    responsavel: "RESPONSAVEL"
};

const PERFIL_PARA_API = {
    ADMIN: "administrador",
    ADMINISTRADOR: "administrador",
    PROFESSOR: "professor",
    RESPONSAVEL: "responsavel"
};

function perfilParaApi(perfil) {
    const valor = String(perfil ?? "")
        .trim()
        .toUpperCase();

    if (PERFIL_PARA_API[valor]) {
        return PERFIL_PARA_API[valor];
    }

    return String(perfil ?? "")
        .trim()
        .toLowerCase();
}

function perfilParaBanco(perfil) {
    return PERFIL_PARA_BANCO[perfilParaApi(perfil)] || null;
}

function ehPerfil(perfil, esperado) {
    return perfilParaApi(perfil) === perfilParaApi(esperado);
}

module.exports = {
    PERFIS_API,
    perfilParaApi,
    perfilParaBanco,
    ehPerfil
};
