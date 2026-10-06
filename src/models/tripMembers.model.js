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
    const query = `SELECT id, role, joined_at, user_id, full_name, email
        FROM (
            SELECT
                NULL::INTEGER AS id,
                'owner'::TEXT AS role,
                trips.created_at AS joined_at,
                owner.id AS user_id,
                owner.full_name,
                owner.email,
                0 AS sort_order
            FROM trips
            INNER JOIN users AS owner ON owner.id = trips.user_id
            WHERE trips.id = $1

            UNION ALL

            SELECT
                tm.id,
                tm.role,
                tm.joined_at,
                member.id AS user_id,
                member.full_name,
                member.email,
                1 AS sort_order
            FROM trip_members AS tm
            INNER JOIN users AS member ON member.id = tm.user_id
            INNER JOIN trips ON trips.id = tm.trip_id
            WHERE tm.trip_id = $1 AND tm.user_id <> trips.user_id
        ) AS trip_people
        ORDER BY sort_order, joined_at ASC;`;

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
