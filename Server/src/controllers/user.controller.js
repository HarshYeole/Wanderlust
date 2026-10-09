import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createHash, randomBytes } from "node:crypto"
import { createUser, findUserByEmail, findUserForLogin, findUserPublicByEmail, getUserById, createPasswordResetToken, deletePasswordResetToken, resetPasswordWithToken, updateUserById, updateRefreshToken, deleteRefreshToken} from "../models/user.model.js"
import { createProfile } from "../models/profile.model.js"
import { generateAccessToken} from "../utils/generateAccessToken.js"
import { generateRefreshToken} from "../utils/generateRefreshToken.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import dotenv from "dotenv"
import uploadOnCloudinary from "../utils/uploadOnCloudinary.js"
import sendPasswordResetEmail from "../utils/sendPasswordResetEmail.js"


dotenv.config()


const registerUser = asyncHandler(async(req, res) => {
    const {fullName, email, password} = req.body
        if(!(fullName && typeof email === "string" && email.trim() && password)){
            return res
            .status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const existingUser = await findUserByEmail(normalizedEmail);

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
            email: normalizedEmail,
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

const requestPasswordReset = asyncHandler(async(req, res) => {
    const rawEmail = req.body?.email
    if (typeof rawEmail !== "string" || !rawEmail.trim()) {
        throw new apiError(400, "Email address is required")
    }
    const email = rawEmail.trim().toLowerCase()

    const genericResponse = {
        success: true,
        message: "If an account exists for that email, a password reset link will be sent."
    }
    const user = await findUserByEmail(email)
    if (user) {
        const token = randomBytes(32).toString("hex")
        const tokenHash = createHash("sha256").update(token).digest("hex")
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
        const storedToken = await createPasswordResetToken(user.id, tokenHash, expiresAt)

        if (storedToken) {
            try {
                await sendPasswordResetEmail(user.email, token)
            } catch (error) {
                await deletePasswordResetToken(tokenHash)
                console.error(
                    "Password reset email could not be sent:",
                    error.code || error.name || "unknown email transport error",
                )
            }
        }
    }

    return res.status(200).json(genericResponse)
})

const resetPassword = asyncHandler(async(req, res) => {
    const { token, password, confirmPassword } = req.body || {}

    if (
        typeof token !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string" ||
        !(token && password && confirmPassword)
    ) {
        throw new apiError(400, "Reset link, new password, and confirmation are required")
    }

    if(password.length < 8){
        throw new apiError(400, "Password must be at least 8 characters")
    }

    if(password !== confirmPassword){
        throw new apiError(400, "Passwords do not match")
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
        throw new apiError(400, "This reset link is invalid or expired. Request a new one.")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const updatedUser = await resetPasswordWithToken(tokenHash, hashedPassword)
    if (!updatedUser) {
        throw new apiError(400, "This reset link is invalid or expired. Request a new one.")
    }

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
        requestPasswordReset,
        resetPassword
}
