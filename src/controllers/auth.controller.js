import { createUser, loginUser } from "../services/auth.services.js";
import { createToken } from "../services/token.services.js";

export const register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, status } = req.body;
        const picture = req.files.picture ? req.files.picture[0] : undefined
        //console.log('req : ', req)
        //console.log('picture dans register : ', req.files?.picture[0])
        let pictureUrl = null
        if (picture) {
            pictureUrl = picture.path
        }
        const user = await createUser({
            name,
            email,
            password,
            confirmPassword,
            status,
            pictureUrl,
        });
        const accessToken = await createToken(
            { userId: user._id },
            "1h",
            process.env.ACCESS_TOKEN_SECRET
        );
        if (user) {
            res.status(200).json({ user: { ...user._doc, accessToken } });
        }
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await loginUser(email, password);
        if (!user) {
            return next(new Error('Invalid credentials')) 
        }
        const accessToken = await createToken(
            { userId: user._id },
            "1h",
            process.env.ACCESS_TOKEN_SECRET
        );
        const refreshToken = await createToken(
            { userId: user._id },
            "30d",
            process.env.REFRESH_TOKEN_SECRET
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/auth/refreshToken",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ user: {...user._doc, accessToken} });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("refreshToken", {
            path: "/auth/refreshToken",
        });
        res.json({ msg: "cookies cleared" });
    } catch (error) {
        next(error);
    }
};
