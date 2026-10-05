import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import {addUserFavorite, getUserFavorites, removeUserFavorites, checkUserFavoriteStatus} from "../controllers/favorite.controller.js"

const router = express.Router();

router.post("/createFavorite", verifyJWT, addUserFavorite)
router.get("/getAllFavorites", verifyJWT, getUserFavorites)
router.delete("/removeFavorite/:destinationId", verifyJWT, removeUserFavorites)
router.get("/isFavorite/:destinationId", verifyJWT, checkUserFavoriteStatus)

export default router;