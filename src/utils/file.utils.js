import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

export const deleteFile = async (pictureUrl) => {

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, pictureUrl)
    const  { DEFAULT_PICTURE_URL, DEFAULT_GROUP_URL } = process.env

    if (pictureUrl === DEFAULT_GROUP_URL || pictureUrl === DEFAULT_PICTURE_URL) {
        return 'Default picture cant be deleted'
    }

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            console.log(err)
        })
        return 'Picture is successfully deleted'
    }

    return 'Picture with this url not found'
}


export const deleteFileOnCloud = async (public_id) => {
    const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
    cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
        secure: true,
    });
    try {
        const r = await cloudinary.uploader.destroy(public_id);
        return true
    } catch (error) {
        return false
    }
}