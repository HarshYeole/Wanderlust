import pool from "../config/db.js"

const createUser = async (
    fullName,
    email,
    password
) => {
    const query = `INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, role, created_at;`;

    const values = [
        fullname,
        email,
        password
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

const findUserByEmail = async (email) => {
    const query = `SELECT id, email FROM users WHERE email = $1`;

    const result = await pool.query(query, [email])

    return result.rows[0];
}
export {createUser, findUserByEmail}
