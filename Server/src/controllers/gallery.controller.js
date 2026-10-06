import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"
import { createGalleryEntry, deleteGalleryEntry, getGalleryEntries, getUserGalleryEntry, getPublicGalleryEntries, addGalleryLike, removeGalleryLike, getFavoriteGalleryEntries, addGalleryFavorite, removeGalleryFavorite, updateGalleryEntry } from "../models/gallery.model.js"
import { deleteCloudinaryImages, getGalleryImagePublicIds } from "../utils/galleryCloudinary.js"

const uploadGalleryImages = async (files) => {
    const uploadedImages = []
    try {
        for (const file of files || []) {
            const uploaded = await uploadOnCloudinary(file.path)
            if (!uploaded?.secure_url || !uploaded?.public_id) {
                throw new apiError(502, "Unable to upload one or more gallery images")
            }
            uploadedImages.push({
                url: uploaded.secure_url,
                public_id: uploaded.public_id
            })
        }
        return uploadedImages
    } catch (error) {
        await deleteCloudinaryImages(uploadedImages.map((image) => image.public_id))
        throw error
    }
}

const cleanupUploadedImages = async (images) => {
    await deleteCloudinaryImages(images.map((image) => image.public_id))
}

const getGuideFields = (body) => ({
    is_public: body.is_public === true || body.is_public === "true",
    transport: body.transport || "",
    food: body.food || "",
    stays: body.stays || "",
    highlights: body.highlights || "",
    challenges: body.challenges || "",
    alternatives: body.alternatives || ""
})

const createUserGalleryEntry = asyncHandler(async (req, res) => {
    const { place_name, trip_details, visited_date, description } = req.body
    if(!place_name){
        throw new apiError(400, "Place name is required")
    }

    const uploadedImages = await uploadGalleryImages(req.files)
    let entry
    try {
        entry = await createGalleryEntry({
            user_id: req.user.id,
            place_name,
            trip_details,
            visited_date,
            description,
            images: uploadedImages.map((image) => image.url),
            image_public_ids: uploadedImages.map((image) => image.public_id),
            ...getGuideFields(req.body)
        })
    } catch (error) {
        await cleanupUploadedImages(uploadedImages)
        throw error
    }

    return res.status(201).json(new apiResponse(201, entry, "Gallery entry created successfully"))
})

const getUserGallery = asyncHandler(async (req, res) => {
    const entries = await getGalleryEntries(req.user.id)
    return res.status(200).json(new apiResponse(200, entries, "Gallery fetched successfully"))
})

const getDiscoverGallery = asyncHandler(async (req, res) => {
    const placeName = String(req.query.place || "").trim()
    if (!placeName) throw new apiError(400, "A place name is required")

    const entries = await getPublicGalleryEntries(placeName, req.user?.id || null)
    return res.status(200).json(new apiResponse(200, entries, "Public travel posts fetched successfully"))
})

const likeUserGalleryEntry = asyncHandler(async (req, res) => {
    const likeCount = await addGalleryLike(req.user.id, req.params.id)
    if (likeCount === null) throw new apiError(404, "Public travel post not found")
    return res.status(200).json(new apiResponse(200, { like_count: likeCount, user_liked: true }, "Travel post liked"))
})

const unlikeUserGalleryEntry = asyncHandler(async (req, res) => {
    const likeCount = await removeGalleryLike(req.user.id, req.params.id)
    return res.status(200).json(new apiResponse(200, { like_count: likeCount, user_liked: false }, "Travel post unliked"))
})

const getUserFavoriteGalleryEntries = asyncHandler(async (req, res) => {
    const entries = await getFavoriteGalleryEntries(req.user.id)
    return res.status(200).json(new apiResponse(200, entries, "Saved travel posts fetched successfully"))
})

const addUserGalleryFavorite = asyncHandler(async (req, res) => {
    const favorite = await addGalleryFavorite(req.user.id, req.params.id)
    if (!favorite) throw new apiError(404, "Public travel post not found")
    return res.status(200).json(new apiResponse(200, favorite, "Travel post saved to favorites"))
})

const removeUserGalleryFavorite = asyncHandler(async (req, res) => {
    await removeGalleryFavorite(req.user.id, req.params.id)
    return res.status(200).json(new apiResponse(200, {}, "Travel post removed from favorites"))
})

const updateUserGalleryEntry = asyncHandler(async (req, res) => {
    const { place_name, trip_details, visited_date, description } = req.body
    if(!place_name){
        throw new apiError(400, "Place name is required")
    }

    const previousEntry = await getUserGalleryEntry(req.params.id, req.user.id)
    if(!previousEntry) throw new apiError(404, "Gallery entry not found")

    const uploadedImages = req.files?.length ? await uploadGalleryImages(req.files) : null
    let entry
    try {
        entry = await updateGalleryEntry({
            id: req.params.id,
            user_id: req.user.id,
            place_name,
            trip_details,
            visited_date,
            description,
            images: uploadedImages?.map((image) => image.url),
            image_public_ids: uploadedImages?.map((image) => image.public_id),
            ...getGuideFields(req.body)
        })
    } catch (error) {
        await cleanupUploadedImages(uploadedImages || [])
        throw error
    }
    if(!entry) {
        await cleanupUploadedImages(uploadedImages || [])
        throw new apiError(404, "Gallery entry not found")
    }
    if(uploadedImages) {
        try {
            await deleteCloudinaryImages(getGalleryImagePublicIds(previousEntry))
        } catch {
            throw new apiError(502, "Gallery updated, but the previous images could not be deleted from Cloudinary")
        }
    }
    return res.status(200).json(new apiResponse(200, entry, "Gallery entry updated successfully"))
})

const removeUserGalleryEntry = asyncHandler(async (req, res) => {
    const entry = await getUserGalleryEntry(req.params.id, req.user.id)
    if(!entry) throw new apiError(404, "Gallery entry not found")
    try {
        await deleteCloudinaryImages(getGalleryImagePublicIds(entry))
    } catch {
        throw new apiError(502, "Unable to delete gallery images from Cloudinary")
    }
    const deleted = await deleteGalleryEntry(req.params.id, req.user.id)
    if(!deleted) throw new apiError(404, "Gallery entry not found")
    return res.status(200).json(new apiResponse(200, {}, "Gallery entry deleted successfully"))
})

export { createUserGalleryEntry, getUserGallery, getDiscoverGallery, likeUserGalleryEntry, unlikeUserGalleryEntry, getUserFavoriteGalleryEntries, addUserGalleryFavorite, removeUserGalleryFavorite, updateUserGalleryEntry, removeUserGalleryEntry }
