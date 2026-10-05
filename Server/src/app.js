import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRoutes from "./routes/user.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import destinationRoutes from "./routes/destination.routes.js"
import tripRoutes from "./routes/trip.routes.js"
import tripDestRoutes from "./routes/tripDestination.routes.js"
import reviewRoutes from "./routes/reviews.routes.js"
import favoriteRoutes from "./routes/favorite.routes.js"
import tripInvitationRoutes from "./routes/invitations.routes.js"
import tripMemberRoutes from "./routes/tripMembers.routes.js"
import galleryRoutes from "./routes/gallery.routes.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000").split(",")

app.use(cors({
  origin(origin, callback) {
    // During local development, accept a phone on the same Wi-Fi network.
    if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error("This origin is not allowed"))
  },
  credentials: true
}))

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
app.use("/api/trip-invitations", tripInvitationRoutes)
app.use("/api/trip-members", tripMemberRoutes)
app.use("/api/gallery", galleryRoutes)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || []
  });
});

export default app;
