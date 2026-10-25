import express from "express";
import { createProduct, getProduct } from "../controller/productControllers.js";
const router = express.Router();

router.get("/", getProduct);

router.post("/", createProduct);

export const productRoutes = router;
