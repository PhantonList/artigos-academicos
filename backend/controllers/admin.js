// Controlador do painel de administração
const db = require('../../database/db');

// Função para obter estatísticas gerais
const getStats = async (req, res) => {
  try {
    // Estatísticas de usuários
    const totalUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const usuariosAtivos = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE ativo = TRUE');
    const usuariosNovos = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    // Estatísticas de artigos
    const totalArtigos = await db.query('SELECT COUNT(*) as total FROM artigos');
    const artigosAprovados = await db.query('SELECT COUNT(*) as total FROM artigos WHERE aprovado = TRUE');
    const artigosPendentes = await db.query('SELECT COUNT(*) as total FROM artigos WHERE aprovado = FALSE');
    const artigosNovos = await db.query('SELECT COUNT(*) as total FROM artigos WHERE data_submissao >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    // Estatísticas de comentários
    const totalComentarios = await db.query('SELECT COUNT(*) as total FROM comentarios');
    const comentariosAprovados = await db.query('SELECT COUNT(*) as total FROM comentarios WHERE aprovado = TRUE');
    const comentariosPendentes = await db.query('SELECT COUNT(*) as total FROM comentarios WHERE aprovado = FALSE');
    
    // Estatísticas de avaliações
    const totalAvaliacoes = await db.query('SELECT COUNT(*) as total FROM avaliacoes');
    const mediaAvaliacoes = await db.query('SELECT AVG(nota) as media FROM avaliacoes');
    
    // Estatísticas de visualizações e downloads
    const totalVisualizacoes = await db.query('SELECT SUM(visualizacoes) as total FROM artigos');
    const totalDownloads = await db.query('SELECT SUM(downloads) as total FROM artigos');
    
    // Artigos mais visualizados
    const artigosMaisVistos = await db.query(`
      SELECT a.id, a.titulo, a.visualizacoes, a.downloads, u.nome as autor_nome
      FROM artigos a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.aprovado = TRUE
      ORDER BY a.visualizacoes DESC
      LIMIT 5
    `);
    
    // Artigos mais baixados
    const artigosMaisBaixados = await db.query(`
      SELECT a.id, a.titulo, a.visualizacoes, a.downloads, u.nome as autor_nome
      FROM artigos a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.aprovado = TRUE
      ORDER BY a.downloads DESC
      LIMIT 5
    `);
    
    // Artigos mais bem avaliados
    const artigosMaisAvaliados = await db.query(`
      SELECT a.id, a.titulo, u.nome as autor_nome,
      (SELECT AVG(nota) FROM avaliacoes WHERE artigo_id = a.id) as media_avaliacao,
      (SELECT COUNT(*) FROM avaliacoes WHERE artigo_id = a.id) as total_avaliacoes
      FROM artigos a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.aprovado = TRUE
      HAVING total_avaliacoes > 0
      ORDER BY media_avaliacao DESC, total_avaliacoes DESC
      LIMIT 5
    `);
    
    res.json({
      usuarios: {
        total: totalUsuarios[0].total,
        ativos: usuariosAtivos[0].total,
        novos: usuariosNovos[0].total
      },
      artigos: {
        total: totalArtigos[0].total,
        aprovados: artigosAprovados[0].total,
        pendentes: artigosPendentes[0].total,
        novos: artigosNovos[0].total
      },
      comentarios: {
        total: totalComentarios[0].total,
        aprovados: comentariosAprovados[0].total,
        pendentes: comentariosPendentes[0].total
      },
      avaliacoes: {
        total: totalAvaliacoes[0].total,
        media: mediaAvaliacoes[0].media || 0
      },
      visualizacoes: totalVisualizacoes[0].total || 0,
      downloads: totalDownloads[0].total || 0,
      artigosMaisVistos,
      artigosMaisBaixados,
      artigosMaisAvaliados
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para listar artigos pendentes de aprovação
const getPendingArticles = async (req, res) => {
  try {
    const artigos = await db.query(`
      SELECT a.*, u.nome as autor_nome, u.instituicao as autor_instituicao, c.nome as categoria_nome
      FROM artigos a
      JOIN usuarios u ON a.usuario_id = u.id
      JOIN categorias c ON a.categoria_id = c.id
      WHERE a.aprovado = FALSE
      ORDER BY a.data_submissao DESC
    `);
    
    // Para cada artigo, buscar suas tags
    for (const artigo of artigos) {
      const tags = await db.query(`
        SELECT t.id, t.nome
        FROM tags t
        JOIN artigos_tags at ON t.id = at.tag_id
        WHERE at.artigo_id = ?
      `, [artigo.id]);
      
      artigo.tags = tags;
    }
    
    res.json({ artigos });
  } catch (error) {
    console.error('Erro ao listar artigos pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para listar comentários pendentes de aprovação
const getPendingComments = async (req, res) => {
  try {
    const comentarios = await db.query(`
      SELECT c.*, u.nome as usuario_nome, u.instituicao as usuario_instituicao,
      a.titulo as artigo_titulo, a.id as artigo_id
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      JOIN artigos a ON c.artigo_id = a.id
      WHERE c.aprovado = FALSE
      ORDER BY c.data_criacao DESC
    `);
    
    res.json({ comentarios });
  } catch (error) {
    console.error('Erro ao listar comentários pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Função para registrar estatísticas diárias
const registerDailyStats = async () => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Verificar se já existem estatísticas para hoje
    const estatisticasExistentes = await db.query('SELECT * FROM estatisticas WHERE data_registro = ?', [hoje]);
    
    if (estatisticasExistentes.length > 0) {
      // Atualizar estatísticas existentes
      const totalUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios');
      const novosUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE DATE(data_criacao) = ?', [hoje]);
      const totalArtigos = await db.query('SELECT COUNT(*) as total FROM artigos');
      const novosArtigos = await db.query('SELECT COUNT(*) as total FROM artigos WHERE DATE(data_submissao) = ?', [hoje]);
      const totalComentarios = await db.query('SELECT COUNT(*) as total FROM comentarios');
      const totalAvaliacoes = await db.query('SELECT COUNT(*) as total FROM avaliacoes');
      const totalVisualizacoes = await db.query('SELECT SUM(visualizacoes) as total FROM artigos');
      const totalDownloads = await db.query('SELECT SUM(downloads) as total FROM artigos');
      
      await db.query(`
        UPDATE estatisticas SET
        total_usuarios = ?,
        novos_usuarios = ?,
        total_artigos = ?,
        novos_artigos = ?,
        total_comentarios = ?,
        total_avaliacoes = ?,
        total_visualizacoes = ?,
        total_downloads = ?
        WHERE data_registro = ?
      `, [
        totalUsuarios[0].total,
        novosUsuarios[0].total,
        totalArtigos[0].total,
        novosArtigos[0].total,
        totalComentarios[0].total,
        totalAvaliacoes[0].total,
        totalVisualizacoes[0].total || 0,
        totalDownloads[0].total || 0,
        hoje
      ]);
    } else {
      // Inserir novas estatísticas
      const totalUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios');
      const novosUsuarios = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE DATE(data_criacao) = ?', [hoje]);
      const totalArtigos = await db.query('SELECT COUNT(*) as total FROM artigos');
      const novosArtigos = await db.query('SELECT COUNT(*) as total FROM artigos WHERE DATE(data_submissao) = ?', [hoje]);
      const totalComentarios = await db.query('SELECT COUNT(*) as total FROM comentarios');
      const totalAvaliacoes = await db.query('SELECT COUNT(*) as total FROM avaliacoes');
      const totalVisualizacoes = await db.query('SELECT SUM(visualizacoes) as total FROM artigos');
      const totalDownloads = await db.query('SELECT SUM(downloads) as total FROM artigos');
      
      await db.query(`
        INSERT INTO estatisticas (
          data_registro,
          total_usuarios,
          novos_usuarios,
          total_artigos,
          novos_artigos,
          total_comentarios,
          total_avaliacoes,
          total_visualizacoes,
          total_downloads
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        hoje,
        totalUsuarios[0].total,
        novosUsuarios[0].total,
        totalArtigos[0].total,
        novosArtigos[0].total,
        totalComentarios[0].total,
        totalAvaliacoes[0].total,
        totalVisualizacoes[0].total || 0,
        totalDownloads[0].total || 0
      ]);
    }
    
    console.log('Estatísticas diárias registradas com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar estatísticas diárias:', error);
  }
};

// Função para obter estatísticas históricas
const getHistoricalStats = async (req, res) => {
  try {
    const { periodo } = req.query;
    let dias = 30; // Padrão: 30 dias
    
    if (periodo === 'semana') {
      dias = 7;
    } else if (periodo === 'mes') {
      dias = 30;
    } else if (periodo === 'ano') {
      dias = 365;
    }
    
    const estatisticas = await db.query(`
      SELECT * FROM estatisticas
      WHERE data_registro >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY data_registro
    `, [dias]);
    
    res.json({ estatisticas });
  } catch (error) {
    console.error('Erro ao obter estatísticas históricas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getStats,
  getPendingArticles,
  getPendingComments,
  registerDailyStats,
  getHistoricalStats
};
