import express from "express"
import auth from "../middlewares/auth.js"

const router = express.Router()

router.get("/me", auth, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user.id,
  })
})

export default router
