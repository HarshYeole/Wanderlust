import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { createReview, getReviewsByDestination, updateReview, deleteReview, getAverageRating } from "../models/reviews.model.js"
import { getDestinationById } from "../models/destination.model.js"


const createUserReview = asyncHandler(async(req, res) => {
    const {
        destination_id,
        rating,
        comment
    } = req.body

    const destination = await getDestinationById(destination_id)

    if(!destination){
        throw new apiError(404, "Destination not found")
    }

    const review = await createReview({
        user_id: req.user.id,
        destination_id,
        rating,
        comment
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, review, "Review created successfully")
    )
});

const getUserReviewsByDestination = asyncHandler(async(req, res) => {
    const {destinationId} = req.params
    const destination = await getDestinationById(destinationId)

    if(!destination){
        throw new apiError(404, "Destination not found")
    }

    const reviews = await getReviewsByDestination(destinationId)

    return res
    .status(200)
    .json(
        new apiResponse(200, reviews, "Reviews fetched successfully")
    )
});

const updateUserReview = asyncHandler(async(req, res) => {
    const {id} = req.params
    const {
        rating,
        comment
    } = req.body

    const updated = await updateReview({
        id,
        user_id: req.user.id,
        rating,
        comment
    })

    if(!updated){
        throw new apiError(404, "Review not found or you are not authorized user to update the review")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, updated, "Review updated successfully")
    )
});

const deleteUserReview = asyncHandler(async(req, res) => {
    const {id} = req.params

    const deleted = await deleteReview(
        id,
        req.user.id
    )

    if(!deleted){
        throw new apiError(404, "Review not found or you are not authorized user to delete the review")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "Review deleted successfully")
    )
});

const getAverageUserRating = asyncHandler(async(req, res) => {
    const {destinationId} = req.params
    const destination = await getDestinationById(destinationId)

    if(!destination){
        throw new apiError(404, "Destination not found")
    }

    const rating = await getAverageRating(destinationId)

    return res
    .status(200)
    .json(
        new apiResponse(200, rating, "Average rating fetched successfully")
    )
});

export {
    createUserReview,
    getUserReviewsByDestination,
    updateUserReview,
    deleteUserReview,
    getAverageUserRating
}
