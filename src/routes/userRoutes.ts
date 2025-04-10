import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.get("/profile", authenticateJWT, userController.getUserData);
router.delete("/delete", authenticateJWT, userController.deleteUser);

export default router;
