const ConexaoBanco =
    require("./src/data/ConexaoBanco");

const ProfessorRepository =
    require("./src/data/ProfessorRepository");

const AcompanhamentoRepository =
    require("./src/data/AcompanhamentoRepository");

const AcompanhamentoService =
    require("./src/services/AcompanhamentoService");

async function testarService() {
    try {
        const banco =
            new ConexaoBanco();

        const professorRepository =
            new ProfessorRepository(banco);

        const acompanhamentoRepository =
            new AcompanhamentoRepository(banco);

        const acompanhamentoService =
            new AcompanhamentoService(
                acompanhamentoRepository,
                professorRepository
            );

        const dados = {
            idAluno: 1,
            idVinculo: 1,
            idBimestre: 1,
            descricao:
                "Teste de validação do acompanhamento.",
            media: 8.5
        };

        const resultado =
            await acompanhamentoService
                .validarNovoAcompanhamento(
                    1,
                    dados
                );

        console.log(
            "Acompanhamento validado com sucesso:"
        );

        console.log(resultado);

    } catch (erro) {
        console.error(
            "Erro de validação:",
            erro.message
        );
    }
}

testarService();