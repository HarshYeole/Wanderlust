import pool from "../config/db.js"

const addFavorite = async({
    user_id,
    destination_id
}) => {
    const query = `INSERT INTO favorites (
        user_id,
        destination_id
    )
    VALUES($1, $2) RETURNING *;`;

    const values = [
        user_id,
        destination_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllFavorites = async(user_id) => {
    const query = `SELECT
    f.id,
    f.created_at,

    d.id AS destination_id,
    d.name,
    d.description,
    d.city,
    d.state,
    d.country,
    d.images

    FROM favorites f
    INNER JOIN destinations d ON f.destination_id = d.id
    WHERE f.user_id = $1 ORDER BY f.created_at DESC;`;

    const result = await pool.query(query, [user_id])
    return result.rows;
};

const removeFavorite = async({
    user_id,
    destination_id
}) => {
    const query = `DELETE FROM favorites
    WHERE user_id = $1 AND destination_id = $2 RETURNING *;`;

    const values = [
        user_id,
        destination_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const isFavorite = async({
    user_id,
    destination_id
}) => {
    const query = `SELECT * FROM favorites WHERE user_id = $1 AND destination_id = $2;`;

    const values = [
        user_id,
        destination_id
    ];
    const result = await pool.query(query, values)
    return result.rows[0];
};


export {
    addFavorite,
    getAllFavorites,
    removeFavorite,
    isFavorite
}
