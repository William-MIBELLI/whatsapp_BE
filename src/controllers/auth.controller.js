import { createUser, loginUser } from "../services/auth.services.js";
import { createToken } from "../services/token.services.js";

export const register = async (req, res, next) => {
    try {
        console.log("on rentre dans register");
        console.log("body : ", req.body);
        const { name, email, password, confirmPassword, status, pictureUrl } =
            req.body;
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
        console.log("user avant le if ", user);
        if (user) {
            console.log("user créé : ", user);
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
        res.json({ accessToken, user });
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
