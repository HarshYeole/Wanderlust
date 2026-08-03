import fs from "fs"
import cloudinary from "../config/cloudinary.js"

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath){
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})

        fs.unlinkSync(localFilePath)

        return response;
    } catch (error) {
        if(localFilePath && fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath)
        }
        console.log("Cloudinary Error:", error.message);
        return null;
    }
};

export default uploadOnCloudinary