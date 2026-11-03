const ConexaoBanco =
    require("./src/data/ConexaoBanco");

const AcompanhamentoRepository =
    require("./src/data/AcompanhamentoRepository");

async function testarAcompanhamento() {
    try {
        const banco = new ConexaoBanco();

        const acompanhamentoRepository =
            new AcompanhamentoRepository(banco);

        const acompanhamento =
            await acompanhamentoRepository.buscarPorId(1);

        if (acompanhamento === null) {
            console.log(
                "Acompanhamento não encontrado."
            );

            return;
        }

        console.log("Acompanhamento encontrado:");

        console.log({
            idAcompanhamento:
                acompanhamento.idAcompanhamento,

            idAluno:
                acompanhamento.idAluno,

            media:
                acompanhamento.media,

            situacao:
                acompanhamento.calcularSituacao(),

            status:
                acompanhamento.status,

            publicado:
                acompanhamento.estaPublicado(),

            podeSerEditado:
                acompanhamento.podeSerEditado()
        });

        const registrosProfessor =
            await acompanhamentoRepository
                .listarPorProfessor(1);

        console.log(
            "\nAcompanhamentos do professor:"
        );

        console.table(registrosProfessor);

    } catch (erro) {
        console.error(
            "Erro durante o teste:",
            erro.message
        );
    }
}

testarAcompanhamento();