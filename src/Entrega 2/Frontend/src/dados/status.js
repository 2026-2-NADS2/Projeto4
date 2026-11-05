// Rótulos e ícones do fluxo editorial de acompanhamentos.
export const STATUS = {
  rascunho: { label: "Rascunho", icon: "pencil" },
  enviado: { label: "Enviado para revisão", short: "Enviado", icon: "send" },
  revisao: { label: "Em revisão", icon: "review" },
  publicado: { label: "Publicado", icon: "check-circle" },
  devolvido: { label: "Devolvido para ajustes", short: "Devolvido", icon: "undo" },
  cancelado: { label: "Cancelado", icon: "ban" },
  pendente: { label: "Pendente", icon: "clock" },
  lido: { label: "Lido", icon: "check" },
  "nao-lido": { label: "Não lido", icon: "eye" },
};

export const STATUS_PADRAO = STATUS.pendente;
