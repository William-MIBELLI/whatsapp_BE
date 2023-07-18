import validator from "validator"
import { User } from '../models/user.model.js'
import bcrypt from 'bcrypt'

export const createUser = async (userData) => {

    const { name, email, password, confirmPassword, status, pictureUrl } = userData
    const { DEFAULT_STATUS, DEFAULT_PICTURE_URL } = process.env

    if(!name || !email || !password || !confirmPassword){
        throw new Error('Please fill all required fields.')
    }

    if(!validator.isLength(name, { min: 3 })){
        throw new Error('Your name needs 3 characters atleast.')
    }

    if(!validator.isEmail(email)){
        throw new Error('Please provide a valid email address')
    }

    if(!validator.isLength(password, {
        min: 6,
        max: 128
    })){
        throw new Error('The password have to be between 6 and 128 characters.')
    }

    if(!validator.equals(password, confirmPassword)){
        throw new Error('Password and confirmation have to match.')
    }

    const existingUser = await User.findOne({ email })

    if(existingUser){
        console.log('existing user : ', existingUser)
        throw new Error('This email address is already used, please take an other one.')
    }

    const user = new User({
        name,
        email,
        password,
        status: status || DEFAULT_STATUS,
        pictureUrl : pictureUrl || DEFAULT_PICTURE_URL
    })

    await user.save()

    return user
}

export const loginUser = async (email, password) => {

    try {
        const user = await User.findOne({ email: email.toLowerCase() })
        if(!user){
            throw new Error('Email invalid')
        }
        const verifiedPassword = await bcrypt.compare(password, user.password)
        if(!verifiedPassword){
            throw new Error('password invalid')
        }

        return user

    } catch (error) {
        return error
    }
}