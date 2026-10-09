import pool from "../config/db.js"

let passwordResetTableReady

const ensurePasswordResetTable = () => {
    if (!passwordResetTableReady) {
        passwordResetTableReady = pool.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            token_hash CHAR(64) NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`).catch((error) => {
            passwordResetTableReady = undefined
            throw error
        })
    }
    return passwordResetTableReady
}

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
    const query = `SELECT id, email FROM users WHERE LOWER(email) = $1;`;

    const result = await pool.query(query, [email])

    return result.rows[0];
}

const findUserPublicByEmail = async (email) => {
    const query = `SELECT id, full_name, email FROM users WHERE email = $1;`;
    const result = await pool.query(query, [email]);
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

const updateUserById = async (userId, { fullName, email }) => {
    const query = `UPDATE users SET full_name = $2, email = $3 WHERE id = $1 RETURNING id, full_name, email, role, created_at;`;
    const result = await pool.query(query, [userId, fullName, email]);
    return result.rows[0];
}

const createPasswordResetToken = async (userId, tokenHash, expiresAt) => {
    await ensurePasswordResetTable()
    await pool.query(`DELETE FROM password_reset_tokens WHERE expires_at <= CURRENT_TIMESTAMP;`)
    const result = await pool.query(`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
            token_hash = EXCLUDED.token_hash,
            expires_at = EXCLUDED.expires_at,
            created_at = CURRENT_TIMESTAMP
        WHERE password_reset_tokens.created_at <= CURRENT_TIMESTAMP - INTERVAL '1 minute'
        RETURNING user_id;`, [userId, tokenHash, expiresAt])
    return result.rows[0] || null
}

const deletePasswordResetToken = async (tokenHash) => {
    await ensurePasswordResetTable()
    await pool.query(`DELETE FROM password_reset_tokens WHERE token_hash = $1;`, [tokenHash])
}

const resetPasswordWithToken = async (tokenHash, password) => {
    await ensurePasswordResetTable()
    const result = await pool.query(`WITH consumed_token AS (
            DELETE FROM password_reset_tokens
            WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP
            RETURNING user_id
        ), updated_user AS (
            UPDATE users
            SET password = $2, refresh_token = NULL
            WHERE id = (SELECT user_id FROM consumed_token)
            RETURNING id
        )
        SELECT id FROM updated_user;`, [tokenHash, password])
    return result.rows[0] || null
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
        findUserPublicByEmail,
        findUserForLogin,  
        getUserById,
        updateUserById,
        createPasswordResetToken,
        deletePasswordResetToken,
        resetPasswordWithToken,
        updateRefreshToken, 
        deleteRefreshToken }
