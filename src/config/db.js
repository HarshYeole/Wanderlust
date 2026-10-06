import pkg from "pg"
import dotenv from "dotenv"

dotenv.config();

const {Pool} = pkg;

const ssl = process.env.DB_SSL === "true"
    ? process.env.DB_SSL_CA
        ? {
            ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n"),
            rejectUnauthorized: true
        }
        : { rejectUnauthorized: false }
    : undefined;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl
})

export default pool;