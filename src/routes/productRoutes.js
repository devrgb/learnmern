import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductById,
  updateProduct,
} from "../controller/productControllers.js";

const router = Router();

router.route("/").post(createProduct).get(getProduct);

router
  .route("/:id")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

export const productRoutes = router;
