# README - Projeto Artigos Acadêmicos

## Sobre o Projeto

O sistema Artigos Acadêmicos é uma plataforma web para compartilhamento e avaliação de artigos científicos entre pesquisadores e estudantes. A plataforma permite cadastro de usuários, submissão de artigos em PDF, comentários, avaliações e gerenciamento de conteúdo por administradores.

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Upload de Arquivos**: Multer

## Funcionalidades Principais

- Cadastro e autenticação de usuários
- Submissão de artigos em formato PDF
- Visualização e download de artigos
- Comentários e avaliações (1-5 estrelas)
- Painel administrativo para gerenciamento de conteúdo
- Design responsivo para dispositivos móveis e desktop

## Estrutura do Projeto

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
│   ├── INSTALACAO.md    # Guia de instalação
│   └── USO.md           # Guia de uso
├── frontend/            # Código do frontend
│   └── public/          # Arquivos estáticos
├── uploads/             # Diretório para armazenar PDFs
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências do projeto
└── server.js            # Ponto de entrada do servidor
```

## Instalação Rápida

1. Clone o repositório
2. Execute `npm install` para instalar dependências
3. Configure o banco de dados MySQL
4. Crie um arquivo `.env` com as configurações necessárias
5. Execute `node server.js` para iniciar o servidor

Para instruções detalhadas, consulte o [Guia de Instalação](docs/INSTALACAO.md).

## Uso

Após a instalação, o sistema estará disponível em `http://localhost:3000`.

Um usuário administrador padrão é criado:
- **Email**: admin@artigosacademicos.com
- **Senha**: admin123

Para instruções detalhadas sobre como utilizar o sistema, consulte o [Guia de Uso](docs/USO.md).

## Fluxo de Trabalho

1. Usuários se cadastram na plataforma
2. Após login, podem submeter artigos em PDF
3. Administradores aprovam ou rejeitam os artigos
4. Artigos aprovados ficam disponíveis para visualização
5. Usuários podem comentar e avaliar os artigos
6. Administradores podem moderar comentários e gerenciar usuários

## Licença

Este projeto está licenciado sob a licença MIT.

## Contato

Para suporte ou dúvidas, entre em contato através do email: admin@artigosacademicos.com
