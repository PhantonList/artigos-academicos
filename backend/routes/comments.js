// Rotas de comentários e avaliações
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');
const { verifyToken, isAdmin, isActive } = require('../middlewares/auth');

// Rota para listar comentários de um artigo
router.get('/article/:artigo_id', commentController.getArticleComments);

// Rota para criar um novo comentário (protegida)
router.post('/article/:artigo_id', verifyToken, isActive, commentController.createComment);

// Rota para aprovar/rejeitar um comentário (apenas para admin)
router.patch('/:id/approval', verifyToken, isAdmin, commentController.toggleCommentApproval);

// Rota para excluir um comentário (protegida)
router.delete('/:id', verifyToken, commentController.deleteComment);

// Rota para avaliar um artigo (protegida)
router.post('/rate/article/:artigo_id', verifyToken, isActive, commentController.rateArticle);

// Rota para obter a avaliação do usuário para um artigo (protegida)
router.get('/rate/article/:artigo_id/user', verifyToken, commentController.getUserRating);

module.exports = router;