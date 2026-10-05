import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"
import { createGalleryEntry, deleteGalleryEntry, getGalleryEntries, getPublicGalleryEntries, addGalleryLike, removeGalleryLike, getFavoriteGalleryEntries, addGalleryFavorite, removeGalleryFavorite, updateGalleryEntry } from "../models/gallery.model.js"

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

    const images = []
    for(const file of req.files || []){
        const uploaded = await uploadOnCloudinary(file.path)
        if(uploaded?.secure_url) images.push(uploaded.secure_url)
    }

    const entry = await createGalleryEntry({
        user_id: req.user.id,
        place_name,
        trip_details,
        visited_date,
        description,
        images,
        ...getGuideFields(req.body)
    })

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

    let images
    if(req.files?.length){
        images = []
        for(const file of req.files){
            const uploaded = await uploadOnCloudinary(file.path)
            if(uploaded?.secure_url) images.push(uploaded.secure_url)
        }
    }

    const entry = await updateGalleryEntry({
        id: req.params.id,
        user_id: req.user.id,
        place_name,
        trip_details,
        visited_date,
        description,
        images,
        ...getGuideFields(req.body)
    })
    if(!entry) throw new apiError(404, "Gallery entry not found")
    return res.status(200).json(new apiResponse(200, entry, "Gallery entry updated successfully"))
})

const removeUserGalleryEntry = asyncHandler(async (req, res) => {
    const deleted = await deleteGalleryEntry(req.params.id, req.user.id)
    if(!deleted) throw new apiError(404, "Gallery entry not found")
    return res.status(200).json(new apiResponse(200, {}, "Gallery entry deleted successfully"))
})

export { createUserGalleryEntry, getUserGallery, getDiscoverGallery, likeUserGalleryEntry, unlikeUserGalleryEntry, getUserFavoriteGalleryEntries, addUserGalleryFavorite, removeUserGalleryFavorite, updateUserGalleryEntry, removeUserGalleryEntry }
