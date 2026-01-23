import pkg from 'pg';

const {Pool} =pkg;

export const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"lms",
    password:"chatur",
    port:5432,
}) ;

pool.on("connect", () => {
 console.log("PostgreSQL connected");
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('Database connection successful'))
    .catch(err => console.error('Database connection failed:', err.message));