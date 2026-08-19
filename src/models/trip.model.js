import pool from "../config/db.js"

const createTrip = async ({
    user_id,
    title,
    description,
    start_date,
    end_date,
    budget,
    status
}) => {
    const query = `INSERT INTO trips (
    user_id,
    title,
    description,
    start_date,
    end_date,
    budget,
    status
    )
    vALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;

    const values = [
        user_id,
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getAllTrips = async(userId) => {
    const query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC;`;

    const result = await pool.query(query, [userId]);

    return result.rows;
};

const getTripById = async(tripId, userId) => {
    const query = userId
        ? `SELECT * FROM trips WHERE id = $1 AND user_id = $2;`
        : `SELECT * FROM trips WHERE id = $1;`;

    const result = await pool.query(query, userId ? [tripId, userId] : [tripId]);

    return result.rows[0];
};

const updateTrip = async({
    trip_id,
    user_id,
    title,
    description,
    start_date,
    end_date,
    budget,
    status
}) => {
    const query = `UPDATE trips SET
    title = $3,
    description = $4,
    start_date = $5,
    end_date = $6,
    budget = $7,
    status = $8,
    updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2
    RETURNING *;`;

    const values = [
        trip_id,
        user_id,
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteTrip = async(trip_id, user_id) => {
    const query = `DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *;`;

    const result = await pool.query(query, [trip_id, user_id]);
    return result.rows[0];
};

export {
    createTrip, 
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip
}
