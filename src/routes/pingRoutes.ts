import { Router } from "express";
import { pingController } from "../controllers/pingController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.get("/ping", authenticateJWT, pingController.ping);

export default router;
