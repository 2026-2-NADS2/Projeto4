# Projeto: Listagem de Alunos

Este é um aplicativo de console desenvolvido em C# (.NET) que tem como objetivo listar alunos e suas respectivas notas. O sistema importa os dados a partir de um arquivo CSV, armazena as informações em um banco de dados local SQLite e oferece uma interface interativa via terminal para visualização paginada dos registros.

## 🚀 Funcionalidades

* **Importação Automática:** Lê um arquivo `alunos.csv` (separado por `;`) e insere ou atualiza os dados dos alunos no banco de dados.

* **Armazenamento Persistente:** Utiliza **SQLite** para garantir que os dados não sejam perdidos ao fechar a aplicação (`alunos.db`).

* **Visualização Paginada:** Exibe a lista de alunos e notas no console de forma organizada em páginas (10 registros por página).

* **Navegação Interativa:** Um menu simples permite ao usuário avançar para a próxima página, voltar para a anterior, pular para a primeira ou última página, ou sair do aplicativo.

## 🛠️ Tecnologias Utilizadas

* **C# / .NET**

* **SQLite** (`Microsoft.Data.Sqlite`) - Banco de dados embutido leve e rápido.

* **Manipulação de Arquivos (`System.IO`)** - Para leitura do arquivo CSV.

## 📁 Estrutura do Projeto

O projeto é composto pelos seguintes arquivos principais:

* **`Aluno.cs`**: Contém a classe modelo que representa o aluno, com suas propriedades `Nome` (texto) e `Nota` (numérico decimal).

* **`AlunosDB.cs`**: Responsável por toda a camada de acesso a dados (Repositório). Ele cria o banco de dados/tabela se não existirem e implementa métodos CRUD (Criar, Ler, Atualizar, Deletar), além do método inteligente `InserirOuAtualizar`.

* **`Program.cs`**: É o ponto de entrada da aplicação. Contém a lógica de verificação do arquivo CSV, rotina de importação de dados e o loop principal (`while`) que renderiza o menu de navegação e a listagem paginada no terminal.

## ⚙️ Como Executar

1. Certifique-se de ter o **.NET SDK** instalado em sua máquina.

2. Garanta que o pacote do SQLite esteja instalado no projeto. Caso não esteja, execute:

   ```
   dotnet add package Microsoft.Data.Sqlite
   
   ```

3. Crie ou posicione o arquivo **`alunos.csv`** três níveis acima da pasta do executável (conforme o caminho `..\..\..\alunos.csv` definido no código), com o seguinte formato:

   ```
   Nome;Nota
   João;8.5
   Maria;9.0
   
   ```

4. Execute a aplicação via terminal:

   ```
   dotnet run
   
   ```