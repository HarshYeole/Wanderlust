import bcrypt from "bcrypt"
import { createUser, findUserByEmail } from "../models/user.model.js"


const registerUser = async(req, res) => {
    try {
        const {fullName, email, password} = req.body
        if(!(fullName || email || password)){
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

        const hashedPaswword = await bcrypt.hash(password, 10)

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

    } catch (error) {
        console.error(error)
        return res
        .status(500)
        .json({
            success: false,
            message: "Internal server error"
        })
    }
} 

export {registerUser}
