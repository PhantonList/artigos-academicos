# Guia de Instalação - Artigos Acadêmicos

Este documento contém instruções detalhadas para instalar e configurar o sistema de Artigos Acadêmicos.

## Requisitos do Sistema

- Node.js (versão 14.x ou superior)
- MySQL (versão 8.0 ou superior)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Passo a Passo para Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/artigos-academicos.git
cd artigos-academicos
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar o Banco de Dados

#### 3.1. Criar o Banco de Dados MySQL

```bash
mysql -u root -p
```

No prompt do MySQL, execute:

```sql
CREATE DATABASE artigos_academicos;
CREATE USER 'artigos_user'@'localhost' IDENTIFIED BY 'artigos_password';
GRANT ALL PRIVILEGES ON artigos_academicos.* TO 'artigos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3.2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DB_HOST=localhost
DB_USER=artigos_user
DB_PASSWORD=artigos_password
DB_NAME=artigos_academicos
PORT=3000
JWT_SECRET=artigos_academicos_secret_key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

> **Nota de Segurança**: Em ambiente de produção, utilize uma chave JWT_SECRET forte e única.

#### 3.3. Inicializar o Banco de Dados

O esquema do banco de dados será criado automaticamente na primeira execução do servidor. O script `database/schema.sql` contém todas as tabelas e dados iniciais.

### 4. Criar Diretório para Uploads

```bash
mkdir -p uploads
chmod 755 uploads
```

### 5. Iniciar o Servidor

```bash
node server.js
```

O servidor estará disponível em `http://localhost:3000`.

## Usuário Administrador Padrão

Após a inicialização do banco de dados, um usuário administrador padrão é criado:

- **Email**: admin@artigosacademicos.com
- **Senha**: admin123

> **Importante**: Altere a senha do administrador após o primeiro login por motivos de segurança.

## Estrutura de Diretórios

```
artigos-academicos/
├── backend/             # Código do backend
│   ├── controllers/     # Controladores da aplicação
│   ├── middlewares/     # Middlewares (autenticação, etc.)
│   └── routes/          # Rotas da API
├── database/            # Configuração do banco de dados
│   ├── db.js            # Conexão com o banco de dados
│   └── schema.sql       # Esquema do banco de dados
├── docs/                # Documentação
├── frontend/            # Código do frontend
│   └── public/          # Arquivos estáticos
├── uploads/             # Diretório para armazenar PDFs
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências do projeto
└── server.js            # Ponto de entrada do servidor
```

## Solução de Problemas

### Erro de Conexão com o Banco de Dados

Verifique se:
- O serviço MySQL está em execução
- As credenciais no arquivo `.env` estão corretas
- O usuário tem permissões adequadas no banco de dados

### Erro ao Fazer Upload de Arquivos

Verifique se:
- O diretório `uploads` existe e tem permissões de escrita
- O tamanho do arquivo não excede o limite configurado em `MAX_FILE_SIZE`
- O arquivo é um PDF válido

### Servidor Não Inicia

Verifique se:
- A porta 3000 não está sendo usada por outro processo
- Todas as dependências foram instaladas corretamente
- O arquivo `.env` está configurado corretamente

## Próximos Passos

Após a instalação, consulte o [Guia de Uso](USO.md) para aprender a utilizar o sistema.
