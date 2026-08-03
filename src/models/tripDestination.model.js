import pool from "../config/db.js"

const addDestinationToTrip = async({
    trip_id,
    destination_id,
    day_number,
    notes
}) => {
    const query = `INSERT INTO trip_destinations (
    trip_id,
    destination_id,
    day_number,
    notes
    )
    VALUES ($1, $2, $3, $4) RETURNING *;`;

    const values = [
        trip_id,
        destination_id,
        day_number,
        notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getTripDestinations = async(tripId) => {
    const query = `SELECT
    td.id,
    td.day_number,
    td.notes,

    d.id AS destination_id,
    d.title,
    d.description,
    d.city,
    d.state,
    d.country,
    d.images

    FROM trip_destinations td
    INNER JOIN destinations d ON td.destination_id = d.id
    WHERE td.trip_id = $1 ORDER BY td.day_number;`;

    const result = await pool.query(query, [tripId]);
    return result.rows;
};

const updateTripDestination = async({
    trip_id,
    destination_id,
    day_number,
    notes
}) => {
    const query = `UPDATE trip_destinations SET
    day_number = $3,
    notes = $4
    WHERE trip_id = $1 AND destination_id = $2
    RETURNING *;`;

    const values = [
        trip_id,
        destination_id,
        day_number,
        notes
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const removeDestinationFromTrip = async(trip_id, destination_id) => {
    const query = `DELETE FROM trip_destinations WHERE trip_id = $1 AND destination_id = $2 RETURNING *;`;

    const result = await pool.query(query, [trip_id, destination_id])
    return result.rows[0];
};

export{
    addDestinationToTrip,
    getTripDestinations,
    updateTripDestination,
    removeDestinationFromTrip
}