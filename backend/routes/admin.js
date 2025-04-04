// Rotas do painel de administração
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Middleware para verificar se o usuário é administrador
router.use(verifyToken, isAdmin);

// Rota para obter estatísticas gerais
router.get('/stats', adminController.getStats);

// Rota para listar artigos pendentes de aprovação
router.get('/articles/pending', adminController.getPendingArticles);

// Rota para listar comentários pendentes de aprovação
router.get('/comments/pending', adminController.getPendingComments);

// Rota para obter estatísticas históricas
router.get('/stats/historical', adminController.getHistoricalStats);

module.exports = router;