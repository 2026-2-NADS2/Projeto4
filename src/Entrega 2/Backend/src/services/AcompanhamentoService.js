class AcompanhamentoService {
    constructor(
        acompanhamentoRepository,
        professorRepository
    ) {
        this.acompanhamentoRepository =
            acompanhamentoRepository;

        this.professorRepository =
            professorRepository;
    }

    validarMedia(media) {
        const valor = Number(media);

        if (
            Number.isNaN(valor) ||
            valor < 0 ||
            valor > 10
        ) {
            throw new Error(
                "A média deve estar entre 0 e 10."
            );
        }

        return valor;
    }

    async validarVinculoProfessor(
        idProfessor,
        idVinculo
    ) {
        const vinculos =
            await this.professorRepository
                .listarVinculos(idProfessor);

        const vinculoEncontrado =
            vinculos.find(
                (vinculo) =>
                    Number(vinculo.id_vinculo) ===
                    Number(idVinculo)
            );

        if (!vinculoEncontrado) {
            throw new Error(
                "O professor não possui este vínculo acadêmico."
            );
        }

        if (!vinculoEncontrado.vinculo_ativo) {
            throw new Error(
                "O vínculo acadêmico está inativo."
            );
        }

        return vinculoEncontrado;
    }

    async validarNovoAcompanhamento(
        idProfessor,
        dados
    ) {
        const media =
            this.validarMedia(dados.media);

        const vinculo =
            await this.validarVinculoProfessor(
                idProfessor,
                dados.idVinculo
            );

        return {
            idAluno: dados.idAluno,
            idVinculo: dados.idVinculo,
            idBimestre: dados.idBimestre,
            descricao: dados.descricao,
            media: media,
            status: "RASCUNHO",
            vinculo: vinculo
        };
    }
}

module.exports = AcompanhamentoService;