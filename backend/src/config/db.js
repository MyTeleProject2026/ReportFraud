const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Add SSL configuration for TiDB Cloud
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

const promisePool = pool.promise();

const connectDB = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Connected to TiDB MySQL successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Don't exit process, let the app handle it
        return false;
    }
};

const query = async (sql, params = []) => {
    try {
        const [rows] = await promisePool.query(sql, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

const queryOne = async (sql, params = []) => {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    pool,
    promisePool,
    connectDB,  // ✅ Make sure this is exported
    query,
    queryOne
};
