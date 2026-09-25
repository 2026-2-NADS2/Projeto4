export const statusLabel = {
    publicado: "PUBLICADO",
    revisao: "EM REVISÃO",
    rascunho: "RASCUNHO",
    devolvido: "DEVOLVIDO",
};

export const RESPONSAVEL_FILTERS = {
    "Relatórios publicados": records => records.filter(record => record.status === "publicado"),
    "Ciência / retorno": records => records.filter(record => record.status === "publicado"),
};
