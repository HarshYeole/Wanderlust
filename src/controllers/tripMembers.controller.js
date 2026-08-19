import asynchandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { getTripById } from "../models/trip.model.js"
import { addMember, getMembers, isMember, removeMember} from "../models/tripMembers.model.js"


const getTripMember = asynchandler(async(req, res) => {
    const {tripId} = req.params

    const trip = await getTripById(tripId)
    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    const member = await isMember({ trip_id: tripId, user_id: req.user.id })
    if(!member){
        throw new apiError(403, "You are not a member of this trip")
    }

    const members = await getMembers(tripId)

    return res
    .status(200)
    .json(
        new apiResponse(200, members, "members fetched successfully")
    )
});

const removeTripMember = asynchandler(async(req, res) => {
    const {tripId, userId} = req.params

    const trip = await getTripById(tripId);
    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    if(trip.user_id !== req.user.id){
        throw new apiError(403, "Only the trip owner can remove the members")
    }

    const member = await removeMember({ trip_id: tripId, user_id: userId })
    if(!member){
        throw new apiError(404, "Member not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, member, "Member removed successfully")
    )
});

export {
    getTripMember,
    removeTripMember
}
