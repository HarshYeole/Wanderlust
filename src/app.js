import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.routes.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  })
})

app.use("/api/users", userRoutes)

export default app
