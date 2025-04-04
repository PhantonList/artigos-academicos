-- Esquema do Banco de Dados para o Projeto Artigos Acadêmicos

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS artigos_academicos;
USE artigos_academicos;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    instituicao VARCHAR(100) NOT NULL,
    tipo ENUM('comum', 'admin') NOT NULL DEFAULT 'comum',
    ativo BOOLEAN NOT NULL DEFAULT FALSE,
    token_confirmacao VARCHAR(100),
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de categorias de artigos
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de artigos
CREATE TABLE IF NOT EXISTS artigos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumo TEXT NOT NULL,
    caminho_arquivo VARCHAR(255) NOT NULL,
    categoria_id INT NOT NULL,
    usuario_id INT NOT NULL,
    aprovado BOOLEAN NOT NULL DEFAULT FALSE,
    data_submissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    visualizacoes INT NOT NULL DEFAULT 0,
    downloads INT NOT NULL DEFAULT 0,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de relacionamento entre artigos e tags (muitos para muitos)
CREATE TABLE IF NOT EXISTS artigos_tags (
    artigo_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (artigo_id, tag_id),
    FOREIGN KEY (artigo_id) REFERENCES artigos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artigo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    aprovado BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artigo_id) REFERENCES artigos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artigo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nota TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_avaliacao (artigo_id, usuario_id),
    FOREIGN KEY (artigo_id) REFERENCES artigos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de estatísticas (para o painel de administração)
CREATE TABLE IF NOT EXISTS estatisticas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_registro DATE NOT NULL UNIQUE,
    total_usuarios INT NOT NULL DEFAULT 0,
    novos_usuarios INT NOT NULL DEFAULT 0,
    total_artigos INT NOT NULL DEFAULT 0,
    novos_artigos INT NOT NULL DEFAULT 0,
    total_comentarios INT NOT NULL DEFAULT 0,
    total_avaliacoes INT NOT NULL DEFAULT 0,
    total_visualizacoes INT NOT NULL DEFAULT 0,
    total_downloads INT NOT NULL DEFAULT 0
);

-- Inserção de dados iniciais

-- Categorias padrão
INSERT INTO categorias (nome, descricao) VALUES 
('Tecnologia', 'Artigos relacionados à tecnologia, computação, sistemas de informação, etc.'),
('Saúde', 'Artigos relacionados à medicina, enfermagem, saúde pública, etc.'),
('Educação', 'Artigos relacionados à pedagogia, métodos de ensino, políticas educacionais, etc.'),
('Engenharia', 'Artigos relacionados às diversas áreas da engenharia.'),
('Ciências Sociais', 'Artigos relacionados à sociologia, antropologia, ciência política, etc.'),
('Ciências Exatas', 'Artigos relacionados à matemática, física, química, etc.'),
('Ciências Biológicas', 'Artigos relacionados à biologia, ecologia, genética, etc.'),
('Administração', 'Artigos relacionados à gestão, negócios, marketing, etc.'),
('Direito', 'Artigos relacionados às ciências jurídicas.'),
('Artes e Humanidades', 'Artigos relacionados à literatura, filosofia, história, artes, etc.');

-- Tags comuns
INSERT INTO tags (nome) VALUES 
('Pesquisa'), ('Inovação'), ('Revisão'), ('Estudo de Caso'), ('Análise'),
('Metodologia'), ('Experimento'), ('Teoria'), ('Aplicação Prática'), ('Interdisciplinar'),
('Sustentabilidade'), ('Ética'), ('Política'), ('Economia'), ('Sociedade'),
('Desenvolvimento'), ('Avaliação'), ('Comparativo'), ('Internacional'), ('Nacional');

-- Usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, instituicao, tipo, ativo) VALUES 
('Administrador', 'admin@artigosacademicos.com', '$2b$10$X7GYt0JxbWvPXjKjXnQnPeYYUXOT5iUQD5xCT2q/9D3qk6FYb0TpG', 'Sistema Artigos Acadêmicos', 'admin', TRUE);