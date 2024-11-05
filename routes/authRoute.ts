import express from "express";
import { register, upload, login } from "../controllers/auth-controllers/authControllers";
// import { login, register, upload } from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.route("/register").post(upload.single("profilepic"), register);
// router.route("/login").post(login);
// router.route("/register").post(upload.single("profilepic"), register);

export default router;
