import express from "express"
import verifyJWT from "../middleware/auth.middleware.js"
import { optionalJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js"
import { createUserGalleryEntry, getUserGallery, getDiscoverGallery, likeUserGalleryEntry, unlikeUserGalleryEntry, getUserFavoriteGalleryEntries, addUserGalleryFavorite, removeUserGalleryFavorite, removeUserGalleryEntry, updateUserGalleryEntry } from "../controllers/gallery.controller.js"

const router = express.Router()

router.post("/", verifyJWT, upload.array("photos", 10), createUserGalleryEntry)
router.get("/discover", optionalJWT, getDiscoverGallery)
router.post("/discover/:id/like", verifyJWT, likeUserGalleryEntry)
router.delete("/discover/:id/like", verifyJWT, unlikeUserGalleryEntry)
router.get("/favorites", verifyJWT, getUserFavoriteGalleryEntries)
router.post("/discover/:id/favorite", verifyJWT, addUserGalleryFavorite)
router.delete("/discover/:id/favorite", verifyJWT, removeUserGalleryFavorite)
router.get("/", verifyJWT, getUserGallery)
router.put("/:id", verifyJWT, upload.array("photos", 10), updateUserGalleryEntry)
router.delete("/:id", verifyJWT, removeUserGalleryEntry)

export default router
