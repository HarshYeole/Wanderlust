import pool from "../config/db.js"

const createDestination = async({
    user_id,
    name,
    country,
    state,
    city,
    description,
    best_time_to_visit,
    estimated_budget,
    images,
    created_by
}) => {
    const query = `INSERT INTO destinations(
    user_id,
    name,
    country,
    state,
    city,
    description,
    best_time_to_visit,
    estimated_budget,
    images,
    created_by
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;

    const values = [
        user_id,
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images,
        created_by
    ];

    const result = await pool.query(query, values)

    return result.rows[0];
};

const getAllDestinations = async(userId) => {
    const query = `SELECT * FROM destinations WHERE user_id = $1 ORDER BY created_at DESC;`;

    const result = await pool.query(query, [userId]);

    return result.rows;
};

const getDestinationById = async(destinationId) => {
    const query = `SELECT * FROM destinations WHERE id = $1;`;

    const result = await pool.query(query, [destinationId]);

    return result.rows[0];
};

const updateDestination = async({
    destinationId,
    user_id,
    name,
    country,
    state,
    city,
    description,
    best_time_to_visit,
    estimated_budget,
    images,
    created_by
}) => {
    const query = `UPDATE destinations SET
    name = $3,
    country = $4,
    state = $5,
    city = $6,
    description = $7,
    best_time_to_visit = $8,
    estimated_budget = $9,
    images = $10,
    created_by = $11,
    updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2
    RETURNING *;`;

    const values = [
        destinationId,
        user_id,
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images,
        created_by
    ];

    const result = await pool.query(query, values)

    return result.rows[0];
};

const deleteDestination = async(destinationId, userId) => {
    const query = `DELETE FROM destinations WHERE id = $1 AND user_id = $2 RETURNING *;`;

    const result = await pool.query(query, [destinationId, userId]);

    return result.rows[0];
};

export {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination
}