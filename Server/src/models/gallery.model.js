import pool from "../config/db.js"

let galleryTablesReady

const ensureGalleryTable = () => {
    if (!galleryTablesReady) {
        galleryTablesReady = (async () => {
            await pool.query(`CREATE TABLE IF NOT EXISTS user_galleries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        place_name VARCHAR(180) NOT NULL,
        trip_details TEXT,
        visited_date DATE,
        description TEXT,
        images TEXT[] NOT NULL DEFAULT '{}',
        image_public_ids TEXT[] NOT NULL DEFAULT '{}',
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        transport TEXT,
        food TEXT,
        stays TEXT,
        highlights TEXT,
        challenges TEXT,
        alternatives TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`)
            await pool.query(`ALTER TABLE user_galleries
        ADD COLUMN IF NOT EXISTS image_public_ids TEXT[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS transport TEXT,
        ADD COLUMN IF NOT EXISTS food TEXT,
        ADD COLUMN IF NOT EXISTS stays TEXT,
        ADD COLUMN IF NOT EXISTS highlights TEXT,
        ADD COLUMN IF NOT EXISTS challenges TEXT,
        ADD COLUMN IF NOT EXISTS alternatives TEXT;`)
            await pool.query(`CREATE TABLE IF NOT EXISTS user_gallery_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gallery_id INTEGER NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, gallery_id)
    );`)
            await pool.query(`CREATE TABLE IF NOT EXISTS user_gallery_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gallery_id INTEGER NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, gallery_id)
    );`)
        })().catch((error) => {
            galleryTablesReady = undefined
            throw error
        })
    }
    return galleryTablesReady
}

const createGalleryEntry = async ({ user_id, place_name, trip_details, visited_date, description, images, image_public_ids, is_public, transport, food, stays, highlights, challenges, alternatives }) => {
    await ensureGalleryTable()
    const result = await pool.query(`INSERT INTO user_galleries
        (user_id, place_name, trip_details, visited_date, description, images, image_public_ids, is_public, transport, food, stays, highlights, challenges, alternatives)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`,
        [user_id, place_name, trip_details, visited_date || null, description, images, image_public_ids, is_public, transport, food, stays, highlights, challenges, alternatives])
    return result.rows[0]
}

const getGalleryEntries = async (userId) => {
    await ensureGalleryTable()
    const result = await pool.query(`SELECT * FROM user_galleries WHERE user_id = $1 ORDER BY visited_date DESC NULLS LAST, created_at DESC;`, [userId])
    return result.rows
}

const getUserGalleryEntry = async (id, userId) => {
    await ensureGalleryTable()
    const result = await pool.query(`SELECT * FROM user_galleries WHERE id = $1 AND user_id = $2;`, [id, userId])
    return result.rows[0]
}

const getPublicGalleryEntries = async (placeName, userId = null) => {
    await ensureGalleryTable()
    const result = await pool.query(`SELECT gallery.*, users.full_name AS author_name,
            COUNT(likes.id)::INTEGER AS like_count,
            COALESCE(BOOL_OR(likes.user_id = $2), FALSE) AS user_liked
        FROM user_galleries AS gallery
        JOIN users ON users.id = gallery.user_id
        LEFT JOIN user_gallery_likes AS likes ON likes.gallery_id = gallery.id
        WHERE gallery.is_public = TRUE
          AND LOWER(gallery.place_name) LIKE LOWER($1)
        GROUP BY gallery.id, users.full_name
        ORDER BY COUNT(likes.id) DESC, gallery.visited_date DESC NULLS LAST, gallery.created_at DESC;`,
        [`%${placeName.trim()}%`, userId])
    return result.rows
}

const addGalleryLike = async (userId, galleryId) => {
    await ensureGalleryTable()
    const post = await pool.query(`SELECT id FROM user_galleries WHERE id = $1 AND is_public = TRUE;`, [galleryId])
    if (!post.rows[0]) return null

    await pool.query(`INSERT INTO user_gallery_likes (user_id, gallery_id)
        VALUES ($1, $2) ON CONFLICT (user_id, gallery_id) DO NOTHING;`, [userId, galleryId])
    const result = await pool.query(`SELECT COUNT(*)::INTEGER AS like_count FROM user_gallery_likes WHERE gallery_id = $1;`, [galleryId])
    return result.rows[0].like_count
}

const removeGalleryLike = async (userId, galleryId) => {
    await ensureGalleryTable()
    await pool.query(`DELETE FROM user_gallery_likes WHERE user_id = $1 AND gallery_id = $2;`, [userId, galleryId])
    const result = await pool.query(`SELECT COUNT(*)::INTEGER AS like_count FROM user_gallery_likes WHERE gallery_id = $1;`, [galleryId])
    return result.rows[0].like_count
}

const getFavoriteGalleryEntries = async (userId) => {
    await ensureGalleryTable()
    const result = await pool.query(`SELECT gallery.*, users.full_name AS author_name
        FROM user_gallery_favorites AS favorites
        JOIN user_galleries AS gallery ON gallery.id = favorites.gallery_id
        JOIN users ON users.id = gallery.user_id
        WHERE favorites.user_id = $1 AND gallery.is_public = TRUE
        ORDER BY favorites.created_at DESC;`, [userId])
    return result.rows
}

const addGalleryFavorite = async (userId, galleryId) => {
    await ensureGalleryTable()
    const post = await pool.query(`SELECT id FROM user_galleries WHERE id = $1 AND is_public = TRUE;`, [galleryId])
    if (!post.rows[0]) return null

    await pool.query(`INSERT INTO user_gallery_favorites (user_id, gallery_id)
        VALUES ($1, $2) ON CONFLICT (user_id, gallery_id) DO NOTHING;`, [userId, galleryId])
    const result = await pool.query(`SELECT * FROM user_gallery_favorites WHERE user_id = $1 AND gallery_id = $2;`, [userId, galleryId])
    return result.rows[0]
}

const removeGalleryFavorite = async (userId, galleryId) => {
    await ensureGalleryTable()
    const result = await pool.query(`DELETE FROM user_gallery_favorites
        WHERE user_id = $1 AND gallery_id = $2 RETURNING *;`, [userId, galleryId])
    return result.rows[0]
}

const updateGalleryEntry = async ({ id, user_id, place_name, trip_details, visited_date, description, images, image_public_ids, is_public, transport, food, stays, highlights, challenges, alternatives }) => {
    await ensureGalleryTable()
    const result = await pool.query(`UPDATE user_galleries SET
        place_name = $1, trip_details = $2, visited_date = $3, description = $4,
        images = COALESCE($5, images), image_public_ids = COALESCE($6, image_public_ids),
        is_public = $7, transport = $8, food = $9, stays = $10, highlights = $11,
        challenges = $12, alternatives = $13
        WHERE id = $14 AND user_id = $15 RETURNING *;`,
        [place_name, trip_details, visited_date || null, description, images, image_public_ids, is_public, transport, food, stays, highlights, challenges, alternatives, id, user_id])
    return result.rows[0]
}

const deleteGalleryEntry = async (id, userId) => {
    await ensureGalleryTable()
    const result = await pool.query(`DELETE FROM user_galleries WHERE id = $1 AND user_id = $2 RETURNING *;`, [id, userId])
    return result.rows[0]
}

export { createGalleryEntry, getGalleryEntries, getUserGalleryEntry, getPublicGalleryEntries, addGalleryLike, removeGalleryLike, getFavoriteGalleryEntries, addGalleryFavorite, removeGalleryFavorite, updateGalleryEntry, deleteGalleryEntry }
