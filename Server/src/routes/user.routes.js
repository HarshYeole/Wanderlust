import express from "express"
import { findUserForInvitation, getCurrentUser, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword, updateCurrentUser } from "../controllers/user.controller.js"
import verifyJWT from "../middleware/auth.middleware.js"
import {upload} from "../middleware/multer.middleware.js"

const router = express.Router()

router.post("/register", upload.single("profileImage"), registerUser)
router.post("/login", loginUser)
router.post("/request-password-reset", requestPasswordReset)
router.post("/reset-password", resetPassword)
router.post("/logout", logoutUser)
router.get("/me", verifyJWT, getCurrentUser)
router.put("/me", verifyJWT, updateCurrentUser)
router.get("/find-by-email", verifyJWT, findUserForInvitation)

export default router
