const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
  connectionString: `Driver={SQL Server Native Client 11.0};Server=${process.env.DB_SERVER || 'CAOTOAN'};Database=${process.env.DB_NAME || 'HighlandsCoffeeDB'};Trusted_Connection=yes;`,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    enableArithAbort: true,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✅ Connected to SQL Server (Windows Auth)');
    } catch (err1) {
      // Thử ODBC Driver 17
      console.log('⚠️  Trying ODBC Driver 17...');
      const config2 = {
        ...config,
        connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || 'CAOTOAN'};Database=${process.env.DB_NAME || 'HighlandsCoffeeDB'};Trusted_Connection=yes;`,
      };
      try {
        pool = await sql.connect(config2);
        console.log('✅ Connected to SQL Server (ODBC 17)');
      } catch (err2) {
        // Thử SQL Server driver mặc định
        console.log('⚠️  Trying default SQL Server driver...');
        const config3 = {
          ...config,
          connectionString: `Driver={SQL Server};Server=${process.env.DB_SERVER || 'CAOTOAN'};Database=${process.env.DB_NAME || 'HighlandsCoffeeDB'};Trusted_Connection=yes;`,
        };
        pool = await sql.connect(config3);
        console.log('✅ Connected to SQL Server (default driver)');
      }
    }
  }
  return pool;
}

async function initDatabase() {
  const p = await getPool();
  console.log('✅ Database ready');
}

module.exports = { sql, getPool, initDatabase };
