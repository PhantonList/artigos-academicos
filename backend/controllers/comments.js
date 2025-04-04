// Controlador de comentários e avaliações
const db = require('../../database/db');

// Função para listar comentários de um artigo
const getArticleComments = async (req, res) => {
  try {
    const { artigo_id } = req.params;
    
    // Verificar se o artigo existe
    const artigos = await db.query('SELECT * FROM artigos WHERE id = ?', [artigo_id]);
    if (artigos.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    
    // Buscar comentários aprovados
    const comentarios = await db.query(`
      SELECT c.*, u.nome as usuario_nome, u.instituicao as usuario_instituicao
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.artigo_id = ? AND c.aprovado = TRUE
      ORDER BY c.data_criacao DESC
    `, [artigo_id]);
    
    res.json({ comentarios });
  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para criar um novo comentário
const createComment = async (req, res) => {
  try {
    const { artigo_id } = req.params;
    const { conteudo } = req.body;
    const usuario_id = req.user.id;
    
    // Validar dados
    if (!conteudo) {
      return res.status(400).json({ error: 'O conteúdo do comentário é obrigatório.' });
    }
    
    // Verificar se o artigo existe
    const artigos = await db.query('SELECT * FROM artigos WHERE id = ?', [artigo_id]);
    if (artigos.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    
    // Verificar se o artigo está aprovado
    if (!artigos[0].aprovado) {
      return res.status(403).json({ error: 'Não é possível comentar em um artigo não aprovado.' });
    }
    
    // Inserir comentário no banco de dados
    // Se o usuário for admin, o comentário é aprovado automaticamente
    const aprovado = req.user.tipo === 'admin';
    
    const result = await db.query(
      'INSERT INTO comentarios (artigo_id, usuario_id, conteudo, aprovado) VALUES (?, ?, ?, ?)',
      [artigo_id, usuario_id, conteudo, aprovado]
    );
    
    res.status(201).json({ 
      message: aprovado 
        ? 'Comentário adicionado com sucesso!' 
        : 'Comentário enviado com sucesso! Aguardando aprovação do administrador.',
      comentario_id: result.insertId,
      aprovado
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para aprovar/rejeitar um comentário (apenas para admin)
const toggleCommentApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprovado } = req.body;
    
    // Verificar se o comentário existe
    const comentarios = await db.query('SELECT * FROM comentarios WHERE id = ?', [id]);
    if (comentarios.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }
    
    // Atualizar status de aprovação
    await db.query('UPDATE comentarios SET aprovado = ? WHERE id = ?', [aprovado, id]);
    
    res.json({ 
      message: aprovado 
        ? 'Comentário aprovado com sucesso!' 
        : 'Comentário rejeitado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao atualizar status do comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para excluir um comentário
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o comentário existe
    const comentarios = await db.query('SELECT * FROM comentarios WHERE id = ?', [id]);
    if (comentarios.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }
    
    const comentario = comentarios[0];
    
    // Verificar se o usuário é o autor do comentário ou admin
    if (req.user.id !== comentario.usuario_id && req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário.' });
    }
    
    // Excluir comentário
    await db.query('DELETE FROM comentarios WHERE id = ?', [id]);
    
    res.json({ message: 'Comentário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para avaliar um artigo
const rateArticle = async (req, res) => {
  try {
    const { artigo_id } = req.params;
    const { nota } = req.body;
    const usuario_id = req.user.id;
    
    // Validar dados
    if (!nota || nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'A nota deve ser um valor entre 1 e 5.' });
    }
    
    // Verificar se o artigo existe
    const artigos = await db.query('SELECT * FROM artigos WHERE id = ?', [artigo_id]);
    if (artigos.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }
    
    // Verificar se o artigo está aprovado
    if (!artigos[0].aprovado) {
      return res.status(403).json({ error: 'Não é possível avaliar um artigo não aprovado.' });
    }
    
    // Verificar se o usuário já avaliou este artigo
    const avaliacoes = await db.query(
      'SELECT * FROM avaliacoes WHERE artigo_id = ? AND usuario_id = ?',
      [artigo_id, usuario_id]
    );
    
    if (avaliacoes.length > 0) {
      // Atualizar avaliação existente
      await db.query(
        'UPDATE avaliacoes SET nota = ? WHERE artigo_id = ? AND usuario_id = ?',
        [nota, artigo_id, usuario_id]
      );
      
      res.json({ message: 'Avaliação atualizada com sucesso!' });
    } else {
      // Inserir nova avaliação
      await db.query(
        'INSERT INTO avaliacoes (artigo_id, usuario_id, nota) VALUES (?, ?, ?)',
        [artigo_id, usuario_id, nota]
      );
      
      res.status(201).json({ message: 'Artigo avaliado com sucesso!' });
    }
  } catch (error) {
    console.error('Erro ao avaliar artigo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para obter a avaliação do usuário para um artigo
const getUserRating = async (req, res) => {
  try {
    const { artigo_id } = req.params;
    const usuario_id = req.user.id;
    
    // Buscar avaliação do usuário
    const avaliacoes = await db.query(
      'SELECT * FROM avaliacoes WHERE artigo_id = ? AND usuario_id = ?',
      [artigo_id, usuario_id]
    );
    
    if (avaliacoes.length === 0) {
      return res.json({ avaliacao: null });
    }
    
    res.json({ avaliacao: avaliacoes[0] });
  } catch (error) {
    console.error('Erro ao obter avaliação do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getArticleComments,
  createComment,
  toggleCommentApproval,
  deleteComment,
  rateArticle,
  getUserRating
};
