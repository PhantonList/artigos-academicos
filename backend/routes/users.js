// Rotas de usuários
const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Rota para listar todos os usuários (apenas para admin)
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

// Rota para obter um usuário específico
router.get('/:id', verifyToken, userController.getUserById);

// Rota para atualizar dados do usuário
router.put('/:id', verifyToken, userController.updateUser);

// Rota para ativar/desativar um usuário (apenas para admin)
router.patch('/:id/status', verifyToken, isAdmin, userController.toggleUserStatus);

// Rota para excluir um usuário
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
