import pool from "../config/db.js"

const createReview = async({
    user_id,
    destination_id,
    rating, 
    comment
}) =>{
    const query = `INSERT INTO reviews (
    user_id,
    destination_id,
    rating,
    comment)
    VALUES ($1, $2, $3, $4) RETURNING *;`;

    values = [
        user_id,
        destination_id,
        rating,
        comment
    ];
    const result = await pool.query(query,values);
    return result.rows[0];
};

const getReviewsByDestination = async(destination_id) => {
    const query = `SELECT 
    r.id,
    r.rating
    r.comment,
    r.created_at,

    u.id AS user_id,
    u.full_name
    
    FROM reviews r INNER JOIN users u ON r.user_id = u.id WHERE r.destination_id = $1
    ORDER BY r.created_at DESC;`;

    const result = await pool.query(query, [destination_id]);
    return result.rows;
};

const updateReview = async({
    id,
    user_id,
    rating,
    comment
}) =>{
    const query = `UPDATE reviews SET
    rating = $3,
    comment = $4,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2 RETURNING *;`;

    const values = [
        id,
        user_id,
        rating,
        comment
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteReview = async(
    id,
    user_id
) => {
    const query = `DELETE FROM reviews
    WHERE id = $1 AND user_id = $2 RETURNING *;`;

    const values = [
        id,
        user_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAverageRating = async(destination_id) => {
    const query = `SELECT ROUND(AVG(rating), 1)
    AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE destination_id = $1;`;

    const result = await pool.query(query, [destination_id])

    return result.rows[0];
};

export {
    createReview,
    getReviewsByDestination,
    updateReview,
    deleteReview,
    getAverageRating
}