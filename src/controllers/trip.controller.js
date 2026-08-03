import { createTrip, getAllTrips, getTripById, updateTrip, deleteTrip } from "../models/trip.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"

const createUserTrip = asyncHandler(async(req, res) => {
    const {
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    } = req.body 

    if(!(title && description)){
        throw new apiError(400, "Title and description required")
    }

    const trip = await createTrip({
        user_id: req.user.id,
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, trip, "Trip created successfully")
    )
});

const getAllUserTrips = asyncHandler(async(req, res) => {
    const trips = await getAllTrips(req.user.id)

    return res
    .status(200)
    .json(
        new apiResponse(200, "Trips fetched successfully")
    )
});

const getUserTripById = asyncHandler(async(req, res) => {
    const {id} = req.params

    const trip = await getTripById(id, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, trip, "Trip fetched successfully")
    )
});

const updateUserTrip = asyncHandler(async(req, res) => {
    const {id} = req.params
    const {
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    } = req.body

    const trip = await getTripById(id, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const update = await updateTrip({
        id,
        user_id: req.user.id,
        title,
        description,
        start_date,
        end_date,
        budget,
        status
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, update, "Trip updated successfully")
    )
});

const deleteUserTrip = asyncHandler(async(req, res) => {
    const {id} = req.params

    const trip = await getTripById(id, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const deleted = await deleteTrip(id, req.user.id)

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "Trip deleted successfully")
    )
});

export {
    createUserTrip,
    getAllUserTrips,
    getUserTripById,
    updateUserTrip,
    deleteUserTrip
}