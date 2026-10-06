import pool from "../config/db.js"

const ensureSavedPlacesTable = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS user_saved_places (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        place_key VARCHAR(180) NOT NULL,
        name VARCHAR(180) NOT NULL,
        country VARCHAR(180) NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, place_key)
    );`)
}

const addSavedPlace = async ({ user_id, place_key, name, country, image }) => {
    await ensureSavedPlacesTable()
    const result = await pool.query(`INSERT INTO user_saved_places (user_id, place_key, name, country, image)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, place_key) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country, image = EXCLUDED.image
        RETURNING *;`, [user_id, place_key, name, country, image])
    return result.rows[0]
}

const getSavedPlaces = async (user_id) => {
    await ensureSavedPlacesTable()
    const result = await pool.query(`SELECT id, place_key, name, country, image, created_at
        FROM user_saved_places WHERE user_id = $1 ORDER BY created_at DESC;`, [user_id])
    return result.rows
}

const removeSavedPlace = async (user_id, place_key) => {
    await ensureSavedPlacesTable()
    const result = await pool.query(`DELETE FROM user_saved_places WHERE user_id = $1 AND place_key = $2 RETURNING *;`, [user_id, place_key])
    return result.rows[0]
}

const isSavedPlace = async (user_id, place_key) => {
    await ensureSavedPlacesTable()
    const result = await pool.query(`SELECT * FROM user_saved_places WHERE user_id = $1 AND place_key = $2;`, [user_id, place_key])
    return result.rows[0]
}

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

    const [result, savedPlaces] = await Promise.all([
        pool.query(query, [user_id]),
        getSavedPlaces(user_id)
    ])
    return [
        ...result.rows.map((favorite) => ({ ...favorite, favorite_type: "destination" })),
        ...savedPlaces.map((place) => ({
            id: place.id,
            created_at: place.created_at,
            destination_id: place.place_key,
            name: place.name,
            description: "",
            city: "",
            country: place.country,
            images: place.image ? [place.image] : [],
            favorite_type: "curated_place"
        }))
    ].sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
};

const removeFavorite = async({
    user_id,
    destination_id
}) => {
    if (!/^\d+$/.test(String(destination_id))) {
        return removeSavedPlace(user_id, destination_id)
    }

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
    if (!/^\d+$/.test(String(destination_id))) {
        return isSavedPlace(user_id, destination_id)
    }

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
    addSavedPlace,
    getAllFavorites,
    removeFavorite,
    isFavorite
}
