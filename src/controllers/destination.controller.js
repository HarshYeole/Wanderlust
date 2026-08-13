import { createDestination, getAllDestinations, getDestinationById, updateDestination, deleteDestination, searchDestination } from "../models/destination.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"


const createUserDestination = asyncHandler(async(req, res) => {

    const imageUrl = [];

    if(req.files && req.files?.length > 0){
        for(const file of req.files){
            const uploaded = await uploadOnCloudinary(file.path);

            if(uploaded){
                imageUrl.push(uploaded.secure_url);
            }
        }
    }

    const {
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images
    } = req.body;

    if(!(name && description && country && city)){
        throw new apiError(400, "Name and description required")
    }

    const destination = await createDestination({
        user_id: req.user.id,
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images: imageUrl
    })
    
    return res
    .status(201)
    .json(
        new apiResponse(201, destination, "Destination created successfully")
    )
});

const getAllUserDestinations = asyncHandler(async(req, res) => {
    const destination = await getAllDestinations(req.user.id)

    return res
    .status(200)
    .json(
        new apiResponse(200, destination, "Destinations fetched successfully")
    )
});

const getUserDestinationById = asyncHandler(async(req, res) => {
    const {id} = req.params

    const destination = await getDestinationById(id)

    if(!destination){
        throw new apiError(400, "Destination not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, destination, "Destination fetched successfully")
    )
});

const updateUserDestination = asyncHandler(async(req, res) => {
    const {
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images
    } = req.body

    const {id} = req.params 
    const getDestination = await getDestinationById(id, req.user.id)

    if(!getDestination){
        throw new apiError(404, "Destination not found")
    }

    let imageUrl = getDestination.images;

    if(req.files && req.files?.lenght > 0){
        imageUrl = []

        for(const file of req.files){
            const uploaded = await uploadOnCloudinary(file.path);
            
            if(uploaded){
                imageUrl.push(uploaded.secure_url);
            }
        }
    }

    const destination = await updateDestination({
        name,
        country,
        state,
        city,
        description,
        best_time_to_visit,
        estimated_budget,
        images: imageUrl
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, destination, "Destination updated successfully")
    )
});

const deleteUserDestination = asyncHandler(async(req, res) => {
    const {id} = req.params

    const getDestination = await getDestinationById(id)

    if(!getDestination){
        throw new apiError(404, "Destination not found")
    }

    await deleteDestination(id, req.user.id);

    return res
    .status(200)
    .json(
        new apiResponse(200, "Destination deleted")
    )
});

const searchDestinations = asyncHandler(async(req, res) => {
    const {
        title,
        city,
        state,
        country
    } = req.query;

    const destinations = await searchDestination({
        title,
        city,
        state,
        country
    });

    return res
    .status(200)
    .json(
        new apiResponse(200, destinations, "Destinations fetched successfully")
    )
});

export {
    createUserDestination,
    getAllUserDestinations,
    getUserDestinationById,
    updateUserDestination,
    deleteUserDestination,
    searchDestinations
}