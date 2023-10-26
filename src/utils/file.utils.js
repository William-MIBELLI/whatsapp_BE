import fs from 'fs'
import path from 'path'

export const deletePicture = async (pictureUrl) => {

    const __dirname = path.resolve();
    const filePath = path.join(__dirname, pictureUrl)
    const  { DEFAULT_PICTURE_URL, DEFAULT_GROUP_URL } = process.env
    console.log('filepath : ', filePath)

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