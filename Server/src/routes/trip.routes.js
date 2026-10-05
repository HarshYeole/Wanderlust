import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import { createUserTrip, getAllUserTrips, getUserTripById, updateUserTrip, deleteUserTrip } from "../controllers/trip.controller.js"

const router = express.Router();

router.post("/createTrip", verifyJWT, createUserTrip)
router.get("/getAllTrips", verifyJWT, getAllUserTrips)
router.get("/getTrip/:id", verifyJWT, getUserTripById)
router.put("/updateTrip/:id", verifyJWT, updateUserTrip)
router.delete("/deleteTrip/:id", verifyJWT, deleteUserTrip)

export default router;