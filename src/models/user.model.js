import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: validator.isEmail,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        pictureUrl: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            default: "New on app",
        },
        resetToken: {
            type: String
        },
        resetTokenExpiration: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    try {
        if (this.isNew) {
            const hashedPassword = await bcrypt.hash(this.password, 12);
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.models.User || mongoose.model("user", userSchema);

export default User;
