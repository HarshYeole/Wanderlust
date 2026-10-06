import cloudinary from "../config/cloudinary.js"

const getPublicIdFromUrl = (imageUrl) => {
    try {
        const image = new URL(imageUrl)
        if (!image.hostname.endsWith(".cloudinary.com")) return null

        const uploadMarker = "/image/upload/"
        const uploadIndex = image.pathname.indexOf(uploadMarker)
        if (uploadIndex === -1) return null

        const pathParts = image.pathname.slice(uploadIndex + uploadMarker.length).split("/")
        const versionIndex = pathParts.findIndex((part) => /^v\d+$/.test(part))
        if (versionIndex !== -1) pathParts.splice(0, versionIndex + 1)
        const publicId = pathParts.join("/").replace(/\.[^.]+$/, "")
        return publicId || null
    } catch {
        return null
    }
}

const getGalleryImagePublicIds = (entry) => {
    const images = Array.isArray(entry.images) ? entry.images : []
    const publicIds = Array.isArray(entry.image_public_ids) ? entry.image_public_ids : []
    return [...new Set(images.map((image, index) => publicIds[index] || getPublicIdFromUrl(image)).filter(Boolean))]
}

const deleteCloudinaryImages = async (publicIds) => {
    const uniquePublicIds = [...new Set(publicIds.filter(Boolean))]
    const outcomes = await Promise.allSettled(
        uniquePublicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId, { resource_type: "image" }),
        ),
    )
    const failedDeletes = outcomes.filter((outcome) =>
        outcome.status === "rejected" ||
        !["ok", "not found"].includes(outcome.value?.result),
    )

    if (failedDeletes.length) {
        throw new Error(`Cloudinary could not delete ${failedDeletes.length} gallery image(s)`)
    }
}

export { deleteCloudinaryImages, getGalleryImagePublicIds }
