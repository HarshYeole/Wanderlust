import pool from "../config/db.js"

const ensureFriendshipsTable = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS user_friendships (
        user_a TEXT NOT NULL,
        user_b TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_a, user_b),
        CHECK (user_a <> user_b)
    );`)
};

const saveFriendship = async (userOne, userTwo) => {
    await ensureFriendshipsTable();
    await pool.query(`INSERT INTO user_friendships (user_a, user_b)
        VALUES (LEAST($1::text, $2::text), GREATEST($1::text, $2::text))
        ON CONFLICT (user_a, user_b) DO NOTHING;`, [userOne, userTwo]);
};

const preserveTripFriendships = async (tripId) => {
    await ensureFriendshipsTable();
    await pool.query(`INSERT INTO user_friendships (user_a, user_b)
        SELECT LEAST(sender_id::text, receiver_id::text), GREATEST(sender_id::text, receiver_id::text)
        FROM trip_invitations
        WHERE trip_id = $1 AND status = 'accepted' AND sender_id <> receiver_id
        ON CONFLICT (user_a, user_b) DO NOTHING;`, [tripId]);
};

const sendInvitation = async ({ trip_id, sender_id, receiver_id }) => {
    const query = `INSERT INTO trip_invitations (trip_id, sender_id, receiver_id) VALUES ($1, $2, $3) RETURNING *;`;
    const result = await pool.query(query, [trip_id, sender_id, receiver_id]);
    return result.rows[0];
};

const acceptInvitation = async ({ id, receiver_id }) => {
    const query = `UPDATE trip_invitations SET status = 'accepted' WHERE id = $1 AND receiver_id = $2 RETURNING *;`;
    const result = await pool.query(query, [id, receiver_id]);
    return result.rows[0];
};

const rejectInvitation = async ({ id, receiver_id }) => {
    const query = `UPDATE trip_invitations SET status = 'rejected' WHERE id = $1 AND receiver_id = $2 RETURNING *;`;
    const result = await pool.query(query, [id, receiver_id]);
    return result.rows[0];
};

const getSocialStats = async (userId) => {
    await ensureFriendshipsTable();
    await pool.query(`INSERT INTO user_friendships (user_a, user_b)
        SELECT LEAST(sender_id::text, receiver_id::text), GREATEST(sender_id::text, receiver_id::text)
        FROM trip_invitations
        WHERE status = 'accepted' AND sender_id <> receiver_id
        ON CONFLICT (user_a, user_b) DO NOTHING;`);
    const query = `SELECT
        (SELECT COUNT(*) FROM trip_invitations WHERE receiver_id = $1 AND status = 'pending') AS pending_invites,
        (SELECT COUNT(*) FROM user_friendships WHERE user_a = $1::text OR user_b = $1::text) AS followers,
        (SELECT COUNT(*) FROM user_friendships WHERE user_a = $1::text OR user_b = $1::text) AS following,
        (SELECT COUNT(*) FROM user_friendships WHERE user_a = $1::text OR user_b = $1::text) AS friends;`;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

const getPendingInvitations = async (userId) => {
    const query = `SELECT
        ti.id,
        ti.trip_id,
        ti.sender_id,
        ti.created_at,
        t.title,
        t.description,
        t.start_date,
        t.end_date,
        t.budget,
        u.full_name AS sender_name,
        u.email AS sender_email
    FROM trip_invitations ti
    INNER JOIN trips t ON t.id = ti.trip_id
    INNER JOIN users u ON u.id = ti.sender_id
    WHERE ti.receiver_id = $1 AND ti.status = 'pending'
    ORDER BY ti.created_at DESC;`;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export {
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    getSocialStats,
    getPendingInvitations,
    saveFriendship,
    preserveTripFriendships
};
