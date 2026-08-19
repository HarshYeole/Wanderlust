import pool from "../config/db.js"

const addMember = async ({
    trip_id,
    user_id,
    role
}) => {
    const query = `INSERT INTO trip_members (trip_id, user_id, role) VALUES ($1, $2, $3) RETURNING *;`;

    const values = [
        trip_id,
        user_id,
        role
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getMembers = async(trip_id) => {
    const query = `SELECT
    tm.id,
    tm.role,
    tm.joined_at,
    
    u.id AS user_id,
    u.full_name,
    u.email FROM trip_members tm INNER JOIN users u ON tm.user_id = u.id WHERE tm.trip_id = $1 ORDER BY tm.joined_at ASC;`;

    const values = [
        trip_id
    ];

    const result = await pool.query(query, values);

    return result.rows;
};

const isMember = async({
    trip_id,
    user_id
}) => {
    const query = `SELECT * from trip_members WHERE trip_id = $1 AND user_id = $2;`;

    const values = [
        trip_id,
        user_id
    ];

    const result = await pool.query(query, values);

    return result.rows[0]
};

const removeMember = async({
    trip_id,
    user_id
}) => {
    const query = `DELETE FROM trip_members WHERE trip_id = $1 AND user_id = $2 RETURNING *;`;

    const values = [
        trip_id,
        user_id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export {
    addMember,
    getMembers,
    isMember,
    removeMember
}
