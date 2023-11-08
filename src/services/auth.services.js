import validator from "validator";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { MailService } from "@sendgrid/mail";

export const createUser = async (userData) => {
    const {
        name,
        email,
        password,
        confirmPassword,
        status = null,
        pictureUrl = null,
    } = userData;
    const { DEFAULT_STATUS, DEFAULT_PICTURE_URL } = process.env;

    if (!name || !email || !password || !confirmPassword) {
        throw new Error("Please fill all required fields.");
    }

    if (!validator.isLength(name, { min: 3 })) {
        throw new Error("Your name needs 3 characters atleast.");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Please provide a valid email address");
    }

    if (
        !validator.isLength(password, {
            min: 6,
            max: 128,
        })
    ) {
        throw new Error(
            "The password have to be between 6 and 128 characters."
        );
    }

    if (!validator.equals(password, confirmPassword)) {
        throw new Error("Password and confirmation have to match.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error(
            "This email address is already used, please take an other one."
        );
    }

    const user = new User({
        name,
        email,
        password,
        status: status || DEFAULT_STATUS,
        pictureUrl: pictureUrl || DEFAULT_PICTURE_URL,
    });

    await user.save();

    return user;
};

export const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new Error("Email invalid");
        }
        const verifiedPassword = await bcrypt.compare(password, user.password);
        if (!verifiedPassword) {
            throw new Error("password invalid");
        }

        return user;
    } catch (error) {
        return null;
    }
};

export const forgetPasswordService = async (email) => {
    if (!validator.isEmail(email)) {
        //On vérifie que ladresse est valide
        throw new Error("This email is not valid. ", email);
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        //On vérifie quun user est bien enregistré avec cette adresse
        throw new Error("No user register with this email address. ", email);
    }

    // On crée les tokens pour setup le reset et on sauvegarde dans User
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // Valable 1 heure
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;

    const save = await user.save();

    if (save === user) {
        //Si la sauvegarde a réussie, on return le resetToken pour lemail
        return resetToken;
    }

    return false;
};

export const sendEmailForResetPassword = async (email, token) => {

    const { SENDGRID_API_KEY, CLIENT_ENDPOINT } = process.env;
    const sgMail = new MailService(); // On initialise le mailer
    sgMail.setApiKey(SENDGRID_API_KEY);

    const message = { //On crée le template de notre email
        to: email,
        from: "william.mibelli@gmail.com",
        subject: "Reset password on WhatsUP",
        text: `For reset your password, click this link and follow instructions : ${CLIENT_ENDPOINT}/reset-password/${token}:`,
        
    };

    const r = await sgMail.send(message) // On envoie le mail
    console.log('r dans sgmail : ', r)

    if (r) {
        return true
    }
    return false
};
