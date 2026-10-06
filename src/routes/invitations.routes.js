import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {sendTripInvitation, acceptTripInvitation, rejectTripInvitation, getUserInvitations, getUserSocialStats} from "../controllers/invitation.controller.js"

const router = express.Router();

router.post("/sendInvitation", verifyJWT, sendTripInvitation)
router.put("/acceptInvitation/:id", verifyJWT, acceptTripInvitation)
router.put("/rejectInvitation/:id", verifyJWT, rejectTripInvitation)
router.get("/social-stats", verifyJWT, getUserSocialStats)
router.get("/my-invitations", verifyJWT, getUserInvitations)

export default router;