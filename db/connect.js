const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config()
/**
 * Connection to the database.
 *  */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: process.env.DB_USER, // use your mysql username.
    password: process.env.DB_PASSWORD, // user your mysql password.
    database: process.env.DB_NAME, //use your Database name
});

pool.getConnection((err, connection) => {
    if(err) 
        console.error("Something went wrong connecting to the database ...");
    
    if(connection)
        connection.release();
    return;
});

module.exports = pool;