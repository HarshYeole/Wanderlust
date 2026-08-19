import asynchandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import {sendInvitation, acceptInvitation, rejectInvitation} from "../models/invitation.model.js"
import { getTripById } from "../models/trip.model.js"
import { addMember } from "../models/tripMembers.model.js"
import { getUserById } from "../models/user.model.js"

const sendTripInvitation = asynchandler(async(req, res) => {
    const {receiver_id, trip_id} = req.body

    if(!trip_id || !receiver_id){
        throw new apiError(400, "Trip ID and receiver ID are required")
    }

    const trip = await getTripById(trip_id, req.user.id)

    if(!trip){
        throw new apiError(404, "Trip not found")
    }

    if(trip.user_id !== req.user.id){
        throw new apiError(403, "Only the trip owner can send the invitations")
    }

    const receiver = await getUserById(receiver_id)

    if(!receiver){
        throw new apiError(404, "User not found")
    }

    if(receiver_id === req.user.id){
        throw new apiError(400, "You cannot invite youself")
    }

    const invite = await sendInvitation({
        trip_id,
        sender_id: req.user.id,
        receiver_id
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, invite, "Invitation sent successfully")
    )
});

const acceptTripInvitation = asynchandler(async(req, res) => {
    const {id} = req.params

    const invite = await acceptInvitation({ id, receiver_id: req.user.id })
    if(!invite){
        throw new apiError(404, "invitation not found")
    }

    await addMember({
        trip_id: invite.trip_id,
        user_id: req.user.id,
        role: "member"
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, invite, "Invitation accepted successfully")
    )
});

const rejectTripInvitation = asynchandler(async(req, res) => {
    const {id} = req.params

    const reject = await rejectInvitation({ id, receiver_id: req.user.id })

    if(!reject){
        throw new apiError(404, "Invitation not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, reject, "Invitation rejected successfully")
    )
});

export {
    sendTripInvitation,
    acceptTripInvitation,
    rejectTripInvitation
}
