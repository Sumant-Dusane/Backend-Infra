import pg from "pg";

const pool = new pg.Pool({
    user: 'admin',
    password: 'admin',
    host: 'postgresdb',
    port: 5432,
    database: 'admin'
});

export default pool;