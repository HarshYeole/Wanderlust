import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {addDestinationToUserTrip, getUserTripDestinations, updateUserTripDestinations, removeDestinationFromUserTrip} from "../controllers/tripDestination.controller.js"

const router = express.Router();

router.post("/:tripId", verifyJWT, addDestinationToUserTrip)
router.get("/:tripId" , verifyJWT, getUserTripDestinations)
router.put("/:tripId/:destinationId", verifyJWT, updateUserTripDestinations)
router.delete("/:tripId/:destinationId", verifyJWT, removeDestinationFromUserTrip)

export default router;
