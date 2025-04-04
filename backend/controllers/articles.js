// Controlador de artigos simplificado para testes
const db = require('../../database/db');

// Função para listar todos os artigos (com filtros e paginação)
const getAllArticles = async (req, res) => {
  try {
    // Versão simplificada para testes
    const artigos = await db.query('SELECT * FROM artigos WHERE aprovado = TRUE');
    
    res.json({
      artigos: artigos || [],
      pagination: {
        total: artigos.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para obter um artigo específico
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar artigo
    const artigos = await db.query('SELECT * FROM artigos WHERE id = ?', [id]);
    
    if (artigos.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    
    res.json({ artigo: artigos[0] });
  } catch (error) {
    console.error('Erro ao obter artigo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para listar categorias
const getCategories = async (req, res) => {
  try {
    const categorias = await db.query('SELECT * FROM categorias ORDER BY nome');
    res.json({ categorias });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para listar tags
const getTags = async (req, res) => {
  try {
    const tags = await db.query('SELECT * FROM tags ORDER BY nome');
    res.json({ tags });
  } catch (error) {
    console.error('Erro ao listar tags:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Exportar apenas as funções necessárias para testes iniciais
module.exports = {
  getAllArticles,
  getArticleById,
  getCategories,
  getTags,
  // Funções stub para evitar erros
  createArticle: (req, res) => res.status(501).json({ message: 'Não implementado para testes' }),
  updateArticle: (req, res) => res.status(501).json({ message: 'Não implementado para testes' }),
  toggleArticleApproval: (req, res) => res.status(501).json({ message: 'Não implementado para testes' }),
  deleteArticle: (req, res) => res.status(501).json({ message: 'Não implementado para testes' }),
  incrementDownloads: (req, res) => res.status(501).json({ message: 'Não implementado para testes' }),
  getUserArticles: (req, res) => res.status(501).json({ message: 'Não implementado para testes' })
};
