import pool from "../config/db.js"

const createProfile = async ({
    user_id,
    profile_picture,
    bio,
    phone,
    country,
    state,
    city,
    preferred_budget
}) => {
    const query = `INSERT INTO profiles(
        user_id,
        profile_picture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;

    const values = [
        user_id,
        profile_picture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const findProfileByUserId = async(usedId) => {
    const query = `SELECT * FROM profiles WHERE user_id = $1;`;

    const result = await pool.query(query, [userId])

    return result.rows[0];
};

const updateProfile = async({
        user_id,
        profile_picture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
}) => {
    const query = `UPDATE profiles SET 
        profile_picture = $2,
        bio = $3,
        phone = $4,
        country = $5,
        state = $6,
        city = $7,
        preferred_budget = $8,
        updated_at = CURRENT_TIMESTAMP WHERE user_id = $1
        RETURNING *;`;
    
    const values = [
        user_id,
        profile_picture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export {
    createProfile,
    findProfileByUserId,
    updateProfile
};