import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.route.js";
import cookieParser from "cookie-parser";
import multer from "multer";

dotenv.config();
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldName = file.fieldname;
        cb(null, `src/upload/${fieldName}`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
});

app.use(cors());
app.use(multer({ storage: fileStorage }).single("picture"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(router);
app.use("", (req, res, next) => {
    const error = new Error("Invalid URL");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    console.log("on est dans le middleware ERROR : ", error.message);
    res.status(error?.status || 500).json({ error: error.message });
});

export default app;
