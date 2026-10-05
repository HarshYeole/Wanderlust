import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {getTripMember, removeTripMember} from "../controllers/tripMembers.controller.js"


const router = express.Router();

router.get("/getTripMembers/:tripId", verifyJWT, getTripMember)
router.delete("/removeTripMember/:tripId/:userId", verifyJWT, removeTripMember)

export default router;
