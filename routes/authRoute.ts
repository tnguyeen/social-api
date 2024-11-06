import express from "express";
import {
  changePassword,
  login,
  register,
  upload,
  verifyAccount,
} from "../controllers/auth-controllers/authControllers";
import { verifyUser } from "../middlewares/auth";

const router = express.Router();

router.post("/login", login);
router.route("/register").post(upload.single("profilepic"), register);
router.route("/verify/:uid").get(verifyAccount);
router.route("/changePassword").post(verifyUser, changePassword);
router.route("/resetPassword").post(changePassword);

export default router;
