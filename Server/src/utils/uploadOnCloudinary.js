import fs from "fs"
import cloudinary from "../config/cloudinary.js"

const uploadOnCloudinary = async(localFilePath, options = {}) => {
    const {
        throwOnError = false,
        retries = 0,
        ...uploadOptions
    } = options

    if(!localFilePath){
        return null;
    }

    try {
        for (let attempt = 0; ; attempt += 1) {
            try {
                return await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto",
                    ...uploadOptions
                })
            } catch (error) {
                const statusCode = Number(error?.http_code || error?.statusCode)
                const canRetry = !statusCode || statusCode === 429 || statusCode >= 500
                if (!canRetry || attempt >= retries) throw error
                await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
            }
        }
    } catch (error) {
        console.error("Cloudinary Error:", error.message);
        if (throwOnError) throw error
        return null;
    } finally {
        try {
            await fs.promises.unlink(localFilePath)
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error("Unable to remove temporary upload file:", error.message)
            }
        }
    }
};

export default uploadOnCloudinary