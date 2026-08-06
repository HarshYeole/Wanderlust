import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/user.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import destinationRoutes from "./routes/destination.routes.js"
import tripRoutes from "./routes/trip.routes.js"
import tripDestRoutes from "./routes/tripDestination.routes.js"
import reviewRoutes from "./routes/reviews.routes.js"
import favoriteRoutes from "./routes/favorite.routes.js"

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
app.use("/api/profile", profileRoutes)
app.use("/api/destination", destinationRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/trip-destinations", tripDestRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/favorites", favoriteRoutes)

export default app;
