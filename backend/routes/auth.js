// Rotas de autenticação
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');

// Rota para registro de usuário
router.post('/register', authController.register);

// Rota para confirmação de email
router.get('/confirm/:token', authController.confirmEmail);

// Rota para login
router.post('/login', authController.login);

// Rota para logout
router.post('/logout', authController.logout);

// Rota para obter dados do usuário atual (protegida)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;