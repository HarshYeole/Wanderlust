import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {createUserProfile, getUserProfile, updateUserProfile} from "../controllers/profile.controller.js"
import {upload} from "../middleware/multer.middleware.js"

const router = express.Router();

router.post("/createProfile", verifyJWT, upload.single("profileImage"), createUserProfile)
router.get("/getProfile", verifyJWT, getUserProfile)
router.put("/updateProfile", verifyJWT, upload.single("profileImage"), updateUserProfile)

export default router;