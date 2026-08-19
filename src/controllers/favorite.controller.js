import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import {addFavorite, getAllFavorites, removeFavorite, isFavorite} from "../models/favorite.model.js"
import { getDestinationById } from "../models/destination.model.js"


const addUserFavorite = asyncHandler(async(req, res) => {
    const {destination_id} = req.body

    const destination = await getDestinationById(destination_id)

    if(!destination){
        throw new apiError(404, "Destination not found")
    }

    const existingFavorite = await isFavorite({ user_id: req.user.id, destination_id })

    if(existingFavorite){
        throw new apiError(409, "Destination already added in favorite")
    }

    const favorite = await addFavorite({
        user_id: req.user.id,
        destination_id
    })

    return res
    .status(201)
    .json(
        new apiResponse(201, favorite, "Destination added to favorite successfully")
    )
});

const getUserFavorites = asyncHandler(async(req, res) => {
    const favorites = await getAllFavorites(req.user.id)

    return res
    .status(200)
    .json(
        new apiResponse(200, favorites, "favorites fetched successfully")
    )
});

const removeUserFavorites = asyncHandler(async(req, res) => {
    const {destinationId} = req.params

    const deletedFavorite = await removeFavorite({
        user_id: req.user.id,
        destination_id: destinationId
    })

    if(!deletedFavorite){
        throw new apiError(404, "Favorite not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "favorite removed successfully")
    )
});

const checkUserFavoriteStatus = asyncHandler(async(req, res) => {
    const {destinationId} = req.params

    const favorite = await isFavorite({
        user_id: req.user.id,
        destination_id: destinationId
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, {isFavorite: !!favorite}, "Favorite status fetched successfully")
    )
});


export {
    addUserFavorite,
    getUserFavorites,
    removeUserFavorites,
    checkUserFavoriteStatus
}
