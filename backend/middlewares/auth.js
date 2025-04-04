// Middleware de autenticação
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  // Obter token do cabeçalho Authorization ou de cookies
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'artigos_academicos_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acesso negado. Usuário não autenticado.' });
  }
  
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
  }
  
  next();
};

// Middleware para verificar se o usuário está ativo
const isActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acesso negado. Usuário não autenticado.' });
  }
  
  if (!req.user.ativo) {
    return res.status(403).json({ error: 'Acesso negado. Conta não ativada.' });
  }
  
  next();
};

// Middleware para verificar se o usuário é o proprietário do recurso
const isOwner = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acesso negado. Usuário não autenticado.' });
    }
    
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({ error: 'ID do recurso não fornecido.' });
    }
    
    try {
      let query;
      let params = [resourceId];
      
      switch (resourceType) {
        case 'article':
          query = 'SELECT usuario_id FROM artigos WHERE id = ?';
          break;
        case 'comment':
          query = 'SELECT usuario_id FROM comentarios WHERE id = ?';
          break;
        default:
          return res.status(500).json({ error: 'Tipo de recurso inválido.' });
      }
      
      const db = require('../../database/db');
      const result = await db.query(query, params);
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Recurso não encontrado.' });
      }
      
      if (result[0].usuario_id !== req.user.id && req.user.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste recurso.' });
      }
      
      next();
    } catch (error) {
      console.error('Erro ao verificar proprietário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isActive,
  isOwner
};
