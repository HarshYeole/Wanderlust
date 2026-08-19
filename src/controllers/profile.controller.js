import asyncHandler from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import { createProfile, findProfileByUserId, updateProfile } from "../models/profile.model.js"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"


const createUserProfile = asyncHandler(async(req, res) => {
    const { bio, phone, country, state, city, preferred_budget } = req.body;
    const existingProfile = await findProfileByUserId(req.user.id);

    if(existingProfile){
        throw new apiError(400, "Profile already exist")
    }

    let profilePicture = null;
    
    if(req.file){
        const uploaded = await uploadOnCloudinary(req.file.path)
        
        if(uploaded){
            profilePicture = uploaded.secure_url;
        }
    }

    const profile = await createProfile({
        user_id: req.user.id,
        profile_picture : profilePicture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
    });

    return res
    .status(201)
    .json(
        new apiResponse(201, profile, "Profile created successfully")
    )
});

const getUserProfile = asyncHandler(async(req, res) => {
    const profile = await findProfileByUserId(req.user.id)

    if(!profile){
        throw new apiError(404, "Profile not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, profile, "Profile fetched successfully")
    )
});

const updateUserProfile = asyncHandler(async(req, res) => {
    const { bio, phone, country, state, city, preferred_budget } = req.body;
    const profile = await findProfileByUserId(req.user.id)

    if(!profile){
        throw new apiError(404, "Profile not found")
    }

    let profilePicture = profile.profile_picture;

    if(req.file){
        const uploaded = await uploadOnCloudinary(req.file.path)

        if(uploaded){
            profilePicture = uploaded.secure_url
        }
    }

    const updated = await updateProfile({
        user_id: req.user.id,
        profile_picture: profilePicture,
        bio,
        phone,
        country,
        state,
        city,
        preferred_budget
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, updated, "Profile updated successfully")
    )
});

export {
    createUserProfile,
    getUserProfile,
    updateUserProfile
};
