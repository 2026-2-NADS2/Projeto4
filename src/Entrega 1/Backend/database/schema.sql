-- Cria o banco de dados do projeto KFKA
CREATE DATABASE IF NOT EXISTS Kfka;

-- Seleciona o banco de dados Kfka
USE Kfka;

-- Tabela de usuarios: cobre os 3 perfis do sistema (admin, professor.responsavel)

-- Remove a tabela usuarios se ela já existir (útil durante o desenvolvimento,
-- para poder rodar este script várias vezes sem erro de "tabela já existe")
DROP TABLE IF EXISTS usuarios;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY, -- identificador único, gerado automaticamente pelo MySQL (1, 2, 3...)
    nome VARCHAR(100) NOT NULL, -- nome do usuário, texto até 150 caracteres, obrigatório
    email VARCHAR(100) NOT NULL UNIQUE, -- e-mail obrigatório e único (não pode haver dois usuários com o mesmo e-mail)
    senha_hash VARCHAR(255) NOT NULL, -- senha já criptografada (hash), nunca texto puro; 255 dá espaço suficiente pro hash
    perfil ENUM("admin", "professor", "responsavel") NOT NULL, -- só aceita um destes 3 valores exatos, evita erro de digitação
    ativo BOOLEAN NOT NULL DEFAULT TRUE,  -- verdadeiro/falso; nasce ativo por padrão (usado pra ativar/inativar usuários)
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- data/hora de criação, preenchida automaticamente pelo MySQL
);



