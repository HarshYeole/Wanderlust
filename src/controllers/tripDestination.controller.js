import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { addDestinationToTrip, getTripDestinations, updateTripDestination, removeDestinationFromTrip} from "../models/tripDestination.model.js"
import {getTripById} from "../models/trip.model.js"
import { getDestinationById } from "../models/destination.model.js"

const addDestinationToUserTrip = asyncHandler(async(req,res) => {
    const {tripId} = req.params

    const {
        destination_id,
        day_number,
        notes
    } = req.body

    const trip = await getTripById(tripId, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const destination = await getDestinationById(destination_id)

    if(!destination){
        throw new apiError(404, "Destination not found")
    }

    const tripDestination = await addDestinationToTrip({
        trip_id: tripId,
        destination_id,
        day_number,
        notes
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, tripDestination, "Destination added to trip successfully")
    )
});

const getUserTripDestinations = asyncHandler(async(req, res) => {
    const {tripId} = req.params

    const trip = await getTripById(tripId, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const destinations = await getTripDestinations(tripId)

    return res
    .status(200)
    .json(
        new apiResponse(200, destinations, "Trip destinations fetched successfully")
    )
});

const updateUserTripDestinations = asyncHandler(async(req, res) => {
    const {tripId, destinationId} = req.params

    const {day_number, notes} = req.body
    
    const trip = await getTripById(tripId, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const updatedDestination = await updateTripDestination({
        trip_id: tripId,
        destination_id: destinationId,
        day_number,
        notes
    });

    if(!updatedDestination){
        throw new apiError(404, "Destination not found in this trip")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedDestination, "Trip destination updated successfully")
    )
});

const removeDestinationFromUserTrip = asyncHandler(async(req, res) => {
    const {tripId, destinationId} = req.params

    const trip = await getTripById(tripId, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const removedDestination = await removeDestinationFromTrip(tripId, destinationId);

    if(!removedDestination){
        throw new apiError(404, "Destination not found in this trip")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "Destination removed from the trip successfully")
    )
});


export {
    addDestinationToUserTrip,
    getUserTripDestinations,
    updateUserTripDestinations,
    removeDestinationFromUserTrip
}