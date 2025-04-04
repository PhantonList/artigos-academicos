// Rotas de artigos
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const articleController = require('../controllers/articles');
const { verifyToken, isAdmin, isActive } = require('../middlewares/auth');

// Configuração de upload de arquivos
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'artigo-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Apenas arquivos PDF são permitidos!'));
    }
    cb(null, true);
  }
});

// Rota para listar todos os artigos (com filtros e paginação)
router.get('/', articleController.getAllArticles);

// Rota para obter um artigo específico
router.get('/:id', articleController.getArticleById);

// Rota para criar um novo artigo (protegida)
router.post('/', verifyToken, isActive, upload.single('arquivo'), articleController.createArticle);

// Rota para atualizar um artigo (protegida)
router.put('/:id', verifyToken, isActive, upload.single('arquivo'), articleController.updateArticle);

// Rota para aprovar/rejeitar um artigo (apenas para admin)
router.patch('/:id/approval', verifyToken, isAdmin, articleController.toggleArticleApproval);

// Rota para excluir um artigo (protegida)
router.delete('/:id', verifyToken, articleController.deleteArticle);

// Rota para incrementar contador de downloads
router.post('/:id/download', articleController.incrementDownloads);

// Rota para listar categorias
router.get('/categories/all', articleController.getCategories);

// Rota para listar tags
router.get('/tags/all', articleController.getTags);

// Rota para listar artigos do usuário atual (protegida)
router.get('/user/me', verifyToken, articleController.getUserArticles);

module.exports = router;
