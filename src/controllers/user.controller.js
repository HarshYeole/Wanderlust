import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createUser, findUserByEmail, findUserForLogin, findUserPublicByEmail, getUserById, updatePasswordByEmail, updateUserById, updateRefreshToken, deleteRefreshToken} from "../models/user.model.js"
import { createProfile } from "../models/profile.model.js"
import { generateAccessToken} from "../utils/generateAccessToken.js"
import { generateRefreshToken} from "../utils/generateRefreshToken.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import dotenv from "dotenv"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"


dotenv.config()


const registerUser = asyncHandler(async(req, res) => {
    const {fullName, email, password} = req.body
        if(!(fullName && email && password)){
            return res
            .status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const existingUser = await findUserByEmail(email);

        if(existingUser){
            return res
            .status(400)
            .json({
                success: false,
                message: "User already exist with this Email"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await createUser({
            fullName,
            email,
            password: hashedPassword
        })

        if(req.file){
            const uploaded = await uploadOnCloudinary(req.file.path)
            await createProfile({
                user_id: user.id,
                profile_picture: uploaded?.secure_url || null
            })
        }

        return res
        .status(201)
        .json({
            success: true,
            message: "User registerd successfully",
            data: user
        })
});

const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body

        if(!(email && password)){
            return res
            .status(401)
            .json({
                success: false,
                message: "Email and password are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const user = await findUserForLogin(normalizedEmail)

        if (!user){
            return res
            .status(404)
            .json({
                success: false,
                message: "No account exists for this email address"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res
            .status(401)
            .json({
                success: false,
                message: "Incorrect password. Please try again."
            })
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        await updateRefreshToken(user.id, refreshToken)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res
        .status(200)
        .json({
            success: true,
            message: "Login Successful",
            accessToken,
            refreshToken
        })
});

const logoutUser = asyncHandler(async(req, res) => {
    const refreshToken = req.cookies?.refreshToken

        if(!refreshToken){
            return res
            .status(200)
            .json({
                success: true,
                message: "Already logged out"
            })
        }

        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        await deleteRefreshToken(decode.id)

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res
        .status(200)
        .json({
            success: true,
            message: "User logged out successfully"
        })
});

const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await getUserById(req.user.id)

    if(!user){
        throw new apiError(404, "User not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "User fetched successfully")
    )
});

const updateCurrentUser = asyncHandler(async(req, res) => {
    const { fullName, email } = req.body

    if(!(fullName?.trim() && email?.trim())){
        throw new apiError(400, "Name and email are required")
    }

    const updatedUser = await updateUserById(req.user.id, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase()
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedUser, "Account updated successfully")
    )
});

const findUserForInvitation = asyncHandler(async(req, res) => {
    const user = await findUserPublicByEmail(req.query.email?.trim().toLowerCase())
    if(!user){
        throw new apiError(404, "No user found with that email")
    }
    return res.status(200).json(new apiResponse(200, user, "User found"))
});

const resetPassword = asyncHandler(async(req, res) => {
    const { email, password, confirmPassword } = req.body
    const normalizedEmail = email?.trim().toLowerCase()

    if(!(normalizedEmail && password && confirmPassword)){
        throw new apiError(400, "Email, new password, and confirmation are required")
    }

    if(password.length < 8){
        throw new apiError(400, "Password must be at least 8 characters")
    }

    if(password !== confirmPassword){
        throw new apiError(400, "Passwords do not match")
    }

    const user = await findUserByEmail(normalizedEmail)
    if(!user){
        throw new apiError(404, "No account exists for this email address")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await updatePasswordByEmail(normalizedEmail, hashedPassword)

    return res.status(200).json({
        success: true,
        message: "Password updated successfully"
    })
});
export {registerUser,
        loginUser,
        logoutUser,
        getCurrentUser,
        updateCurrentUser,
        findUserForInvitation,
        resetPassword
}
