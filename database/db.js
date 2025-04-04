// Configuração de conexão com o banco de dados MySQL

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Cria pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'artigos_academicos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exporta pool com suporte a Promises
const promisePool = pool.promise();

module.exports = {
  pool: promisePool,
  
  // Função para executar queries
  query: async (sql, params) => {
    try {
      const [rows, fields] = await promisePool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Erro ao executar query:', error);
      throw error;
    }
  },
  
  // Função para inicializar o banco de dados
  initDatabase: async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Divide o schema em comandos individuais
        const commands = schema.split(';').filter(cmd => cmd.trim() !== '');
        
        // Usar query em vez de execute para comandos DDL
        for (const command of commands) {
          if (command.trim()) {
            await promisePool.query(command + ';');
          }
        }
        
        console.log('Banco de dados inicializado com sucesso!');
      } else {
        console.error('Arquivo de schema não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }
};
