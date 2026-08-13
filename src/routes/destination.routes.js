import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import { createUserDestination, getAllUserDestinations, getUserDestinationById, updateUserDestination, deleteUserDestination, searchDestinations } from "../controllers/destination.controller.js"
import {upload} from "../middleware/multer.middleware.js"

const router = express.Router();

router.post("/createDestination", verifyJWT, upload.array("images", 10), createUserDestination)
router.get("/getAllDestinations", verifyJWT, getAllUserDestinations)
router.get("/getDestination/:id", verifyJWT, getUserDestinationById)
router.put("/updateDestination/:id", verifyJWT, upload.array("images", 10), updateUserDestination)
router.delete("/deleteDestination/:id", verifyJWT, deleteUserDestination)
router.get("/search", verifyJWT, searchDestinations)

export default router;