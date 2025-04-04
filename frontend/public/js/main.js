// main.js - Arquivo principal de JavaScript para o frontend

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de tooltips e popovers do Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Função para carregar artigos recentes (simulação)
    function carregarArtigosRecentes() {
        // Esta função seria substituída por uma chamada AJAX real para a API
        console.log('Carregando artigos recentes...');
        
        // Exemplo de como seria a chamada real:
        /*
        fetch('/api/artigos/recentes')
            .then(response => response.json())
            .then(data => {
                const artigosContainer = document.getElementById('artigos-recentes');
                artigosContainer.innerHTML = '';
                
                data.forEach(artigo => {
                    const artigoHTML = criarCardArtigo(artigo);
                    artigosContainer.innerHTML += artigoHTML;
                });
            })
            .catch(error => {
                console.error('Erro ao carregar artigos recentes:', error);
            });
        */
    }

    // Função para criar HTML de um card de artigo
    function criarCardArtigo(artigo) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${artigo.titulo}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${artigo.autor}, ${artigo.instituicao}</h6>
                        <p class="card-text">${artigo.resumo.substring(0, 100)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${artigo.categoria}</span>
                            <small class="text-muted">${formatarData(artigo.data_publicacao)}</small>
                        </div>
                        <div class="mt-3">
                            <span class="me-2"><i class="fas fa-download"></i> ${artigo.downloads}</span>
                            <span><i class="fas fa-star"></i> ${artigo.avaliacao}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <a href="/artigo/${artigo.id}" class="btn btn-sm btn-outline-primary">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Função para formatar data
    function formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Sistema de avaliação por estrelas
    const estrelas = document.querySelectorAll('.estrela-avaliacao');
    if (estrelas.length > 0) {
        estrelas.forEach(estrela => {
            estrela.addEventListener('click', function() {
                const valor = this.getAttribute('data-valor');
                document.getElementById('avaliacao').value = valor;
                
                // Atualiza visual das estrelas
                estrelas.forEach(e => {
                    if (e.getAttribute('data-valor') <= valor) {
                        e.classList.add('ativo');
                    } else {
                        e.classList.remove('ativo');
                    }
                });
            });
        });
    }

    // Validação de formulários
    const forms = document.querySelectorAll('.needs-validation');
    if (forms.length > 0) {
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }

    // Inicialização de componentes específicos da página
    const paginaAtual = window.location.pathname;
    
    if (paginaAtual === '/' || paginaAtual === '/index.html') {
        carregarArtigosRecentes();
    } else if (paginaAtual.includes('/artigo/')) {
        // Inicialização específica para página de detalhes do artigo
        inicializarComentarios();
    } else if (paginaAtual === '/submeter') {
        // Inicialização específica para página de submissão
        inicializarUploadArquivo();
    } else if (paginaAtual === '/admin') {
        // Inicialização específica para painel de administração
        inicializarPainelAdmin();
    }

    // Função para inicializar sistema de comentários
    function inicializarComentarios() {
        console.log('Inicializando sistema de comentários...');
        // Implementação real seria feita aqui
    }

    // Função para inicializar upload de arquivo
    function inicializarUploadArquivo() {
        console.log('Inicializando sistema de upload...');
        
        const inputArquivo = document.getElementById('arquivo-pdf');
        if (inputArquivo) {
            inputArquivo.addEventListener('change', function() {
                const nomeArquivo = this.files[0]?.name || 'Nenhum arquivo selecionado';
                document.getElementById('nome-arquivo').textContent = nomeArquivo;
            });
        }
    }

    // Função para inicializar painel de administração
    function inicializarPainelAdmin() {
        console.log('Inicializando painel de administração...');
        // Implementação real seria feita aqui
    }

    // Função para mostrar/esconder senha
    const toggleSenha = document.getElementById('toggle-senha');
    if (toggleSenha) {
        toggleSenha.addEventListener('click', function() {
            const inputSenha = document.getElementById('senha');
            const tipo = inputSenha.getAttribute('type') === 'password' ? 'text' : 'password';
            inputSenha.setAttribute('type', tipo);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
});
