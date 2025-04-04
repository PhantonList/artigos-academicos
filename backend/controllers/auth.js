// Controlador de autenticação
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../database/db');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Função para registrar um novo usuário
const register = async (req, res) => {
  try {
    const { nome, email, senha, instituicao } = req.body;
    
    // Validar dados
    if (!nome || !email || !senha || !instituicao) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    
    // Verificar se o email já está em uso
    const existingUser = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }
    
    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Gerar token de confirmação
    const confirmationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    
    // Inserir usuário no banco de dados
    await db.query(
      'INSERT INTO usuarios (nome, email, senha, instituicao, token_confirmacao) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, instituicao, confirmationToken]
    );
    
    // Em um ambiente real, enviaríamos um email de confirmação aqui
    // Para fins de demonstração, vamos ativar o usuário automaticamente
    const newUser = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    await db.query('UPDATE usuarios SET ativo = TRUE WHERE id = ?', [newUser[0].id]);
    
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso! Sua conta já está ativa.',
      // Em um ambiente real, não retornaríamos o token de confirmação
      confirmationToken
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para confirmar email (ativar conta)
const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Buscar usuário pelo token de confirmação
    const user = await db.query('SELECT * FROM usuarios WHERE token_confirmacao = ?', [token]);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Token de confirmação inválido.' });
    }
    
    // Ativar conta do usuário
    await db.query(
      'UPDATE usuarios SET ativo = TRUE, token_confirmacao = NULL WHERE id = ?',
      [user[0].id]
    );
    
    res.json({ message: 'Conta ativada com sucesso! Agora você pode fazer login.' });
  } catch (error) {
    console.error('Erro ao confirmar email:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para fazer login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validar dados
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    
    // Buscar usuário pelo email
    const users = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    const user = users[0];
    
    // Verificar senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    // Verificar se a conta está ativa
    if (!user.ativo) {
      return res.status(403).json({ 
        error: 'Conta não ativada. Por favor, verifique seu email para ativar sua conta.',
        needsActivation: true
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        nome: user.nome, 
        email: user.email,
        tipo: user.tipo,
        ativo: user.ativo
      },
      process.env.JWT_SECRET || 'artigos_academicos_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Definir cookie com o token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
    
    // Retornar dados do usuário e token
    res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        instituicao: user.instituicao,
        tipo: user.tipo
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para fazer logout
const logout = (req, res) => {
  // Limpar cookie
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso!' });
};

// Função para obter dados do usuário atual
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar dados do usuário
    const users = await db.query(
      'SELECT id, nome, email, instituicao, tipo, ativo, data_criacao FROM usuarios WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  register,
  confirmEmail,
  login,
  logout,
  getCurrentUser
};
