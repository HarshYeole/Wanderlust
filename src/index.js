import app from "./app.js"
import dotenv from "dotenv"
import pool from "./config/db.js"

dotenv.config()

const PORT = process.env.PORT || 5000

async function startServer(){
    try {
        await pool.query("SELECT NOW()")
        console.log("Database connected")

        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`)
        })
    } catch (error) {
        console.error("Database connection failed")
        console.error(error)
    }
}

startServer();
