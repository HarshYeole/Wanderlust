import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {createUserReview, getUserReviewsByDestination, updateUserReview, deleteUserReview, getAverageUserRating} from "../controllers/reviews.controller.js"

const router = express.Router();

router.post("/createReview", verifyJWT, createUserReview)
router.get("/getAllReviews/:destinationId", verifyJWT, getUserReviewsByDestination)
router.put("/updateReview/:id", verifyJWT, updateUserReview)
router.delete("/deleteReview/:id", deleteUserReview)
router.get("/getAvgReview/:destinationId", verifyJWT, getAverageUserRating)

export default router;