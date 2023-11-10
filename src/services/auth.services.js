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
        picture
    } = userData;
    const { secure_url, public_id } = JSON.parse(picture)
    console.log('picture dans createuser : ', picture)
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
        pictureUrl: secure_url || DEFAULT_PICTURE_URL,
        pictureId: public_id || undefined
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

    const message = {
        //On crée le template de notre email
        to: email,
        from: "william.mibelli@gmail.com",
        subject: "Reset password on WhatsUP",
        text: `For reset your password, click this link and follow instructions : ${CLIENT_ENDPOINT}/reset-password/${token}`,
        html: `
        <div style="background-color:#111B21; display: flex; justify-content: center; align-items: center;" >
            <h2 style="color: #00A884; margin: auto;">WhatsUP</h2>
            <p style="color:#8696A0; margin: auto;" >Hello there, we receive a request for reseting your password !</p>
            <p style="color:#8696A0; margin: auto;" >Just click on this <a target="_blank" style="color: white; font-weight: bold; text-decoration: none;" href="${CLIENT_ENDPOINT}/reset-password/${token}">link</a>, its that easy 😎<p>
            <p style="color:#8696A0; margin: auto;">See you 👋</p>
        </div>
        `,
    };

    const r = await sgMail.send(message); // On envoie le mail
    console.log("r dans sgmail : ", r);

    if (r) {
        return true;
    }
    return false;
};

export const resetPasswordOnDb = async (email, password, token) => {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        //Si pas d'user avec cet email
        throw new Error("No user with this email");
    }
    const { resetToken, resetTokenExpiration } = user;
    if (resetToken !== token) {
        //Si le resetToken ne correspond pas avec celui reçu
        throw new Error("This token is invalid");
    }

    if (Date.now() > resetTokenExpiration) {
        //Si le resetTokenExpiration est dépassé
        throw new Error("This token is out of date, send a new request");
    }
    //Si tous les tests sont passés, on hash le nouveau password, on supprime les tokens et on save
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    return true;
};

export const changePasswordOnDb = async (userId, password, newPassword) => {
    const user = await User.findById(userId);
    console.log('password dans services : ', password)
    if (!user) {
        //On vérifie que l'user avec cet ID existe
        throw new Error("No user with this id");
    }
    const verifiedPassword = await bcrypt.compare(password, user.password);
    if (!verifiedPassword) {
        //On vérifie que le password correspond
        throw new Error("Invalid password : ", password);
    }
    //On hash le newPassword
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    const r = await user.save();

    if (r === user) {
        return true;
    }

    return false;
};
