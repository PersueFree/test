const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'Lxarmed@163',
    database: 'testdb'
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;