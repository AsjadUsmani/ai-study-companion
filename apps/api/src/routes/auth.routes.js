import { Router } from "express";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { login, logout, register } from "../controllers/auth.controllers.js";

const router = Router();

router.post(
  "/register",
  registerValidator,
  validate,
  register
)
router.post(
  "/login",
  loginValidator,
  validate,
  login
)

router.post("/logout", logout)

export default router