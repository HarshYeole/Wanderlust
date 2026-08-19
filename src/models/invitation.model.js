import pool from '../config/db.js'

const sendInvitation = async ({
    trip_id,
    sender_id,
    receiver_id
}) => {
    const query = `INSERT INTO trip_invitations (trip_id, sender_id, receiver_id) VALUES ($1, $2, $3) RETURNING *;`;

    const values = [
        trip_id,
        sender_id,
        receiver_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const acceptInvitation = async ({
    id,
    receiver_id
}) => {
    const query = `UPDATE trip_invitations SET status = 'accepted' WHERE id = $1 AND receiver_id = $2 RETURNING *;`;

    const values = [
        id,
        receiver_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const rejectInvitation = async ({
    id,
    receiver_id
}) => {
    const query = `UPDATE trip_invitations SET status = 'rejected' WHERE id = $1 AND receiver_id = $2 RETURNING *;`;

    const values = [
        id,
        receiver_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0]
};

export {
    sendInvitation,
    acceptInvitation,
    rejectInvitation
}