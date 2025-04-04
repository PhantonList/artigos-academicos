// Controlador de usuários
const bcrypt = require('bcrypt');
const db = require('../../database/db');

// Função para listar todos os usuários (apenas para admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, nome, email, instituicao, tipo, ativo, data_criacao FROM usuarios ORDER BY nome'
    );
    
    res.json({ users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para obter um usuário específico
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await db.query(
      'SELECT id, nome, email, instituicao, tipo, ativo, data_criacao FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para atualizar dados do usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, instituicao, senha } = req.body;
    
    // Verificar se o usuário existe
    const users = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    // Verificar se o usuário atual tem permissão para atualizar este usuário
    if (req.user.id !== parseInt(id) && req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para atualizar este usuário.' });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== users[0].email) {
      const existingUser = await db.query('SELECT * FROM usuarios WHERE email = ? AND id != ?', [email, id]);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Este email já está em uso por outro usuário.' });
      }
    }
    
    // Preparar dados para atualização
    const updateData = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (instituicao) updateData.instituicao = instituicao;
    
    // Se a senha foi fornecida, criptografá-la
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(senha, salt);
    }
    
    // Construir query de atualização
    let query = 'UPDATE usuarios SET ';
    const queryParams = [];
    
    Object.entries(updateData).forEach(([key, value], index) => {
      query += `${key} = ?`;
      queryParams.push(value);
      
      if (index < Object.entries(updateData).length - 1) {
        query += ', ';
      }
    });
    
    query += ' WHERE id = ?';
    queryParams.push(id);
    
    // Executar atualização
    if (queryParams.length > 1) { // Verificar se há dados para atualizar
      await db.query(query, queryParams);
    }
    
    res.json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para ativar/desativar um usuário (apenas para admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    
    // Verificar se o usuário existe
    const users = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    // Não permitir que o admin desative sua própria conta
    if (parseInt(id) === req.user.id && ativo === false) {
      return res.status(400).json({ error: 'Você não pode desativar sua própria conta.' });
    }
    
    // Atualizar status do usuário
    await db.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [ativo, id]);
    
    res.json({ 
      message: ativo 
        ? 'Usuário ativado com sucesso!' 
        : 'Usuário desativado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para excluir um usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const users = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    // Verificar se o usuário atual tem permissão para excluir este usuário
    if (req.user.id !== parseInt(id) && req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este usuário.' });
    }
    
    // Não permitir que o admin exclua sua própria conta
    if (parseInt(id) === req.user.id && req.user.tipo === 'admin') {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta de administrador.' });
    }
    
    // Excluir usuário
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    
    res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
};
