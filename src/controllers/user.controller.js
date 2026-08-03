import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createUser, findUserByEmail, findUserForLogin, updateRefreshToken, deleteRefreshToken} from "../models/user.model.js"
import { generateAccessToken} from "../utils/generateAccessToken.js"
import { generateRefreshToken} from "../utils/generateRefreshToken.js"
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import dotenv from "dotenv"


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

        return res
        .status(201)
        .json({
            success: true,
            message: "User registerd successfully",
            data: user
        })
});

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body

        if(!(email && password)){
            return res
            .status(401)
            .json({
                success: false,
                message: "Email and password are required"
            })
        }

        const user = await findUserForLogin(email)

        if (!user){
            return res
            .status(404)
            .json({
                success: false,
                message: "User not found"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res
            .status(401)
            .json({
                success: false,
                message: "Invalid Password"
            })
        }

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await updateRefreshToken(user.id, refreshToken)

        res.cookie("accessToken", accessToken),{
            httpOnly: true,
            secure: true
        }

        res.cookie("refreshToken", refreshToken),{
            httpOnly: true,
            secure: true
        }

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
    const refreshToken = req.cookie?.refreshToken

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
export {registerUser,
        loginUser,
        logoutUser
}
