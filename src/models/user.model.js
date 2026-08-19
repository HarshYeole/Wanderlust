import pool from "../config/db.js"

const createUser = async ({
    fullName,
    email,
    password
}) => {
    const query = `INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, role, created_at;`;

    const values = [
        fullName,
        email,
        password
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

const findUserByEmail = async (email) => {
    const query = `SELECT id, email FROM users WHERE email = $1;`;

    const result = await pool.query(query, [email])

    return result.rows[0];
}

const findUserForLogin = async (email) => {
    const query = `SELECT id, full_name, email, password, refresh_token FROM users WHERE email = $1;`;

    const result = await pool.query(query, [email])

    return result.rows[0];
}

const getUserById = async (userId) => {
    const query = `SELECT id, full_name, email, role, created_at FROM users WHERE id = $1;`;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
}

const updateRefreshToken = async (userId, refreshToken) => {
    const query = `UPDATE users SET refresh_token = $1 WHERE id = $2;`;

    await pool.query(query, [refreshToken, userId]);
}

const deleteRefreshToken = async (userId) => {
    const query = `UPDATE users SET refresh_token = NULL WHERE id= $1;`;

    await pool.query(query, [userId]);
}

export { createUser, 
        findUserByEmail, 
        findUserForLogin,  
        getUserById,
        updateRefreshToken, 
        deleteRefreshToken }
