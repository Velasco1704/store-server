import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductByCategory,
  getProductById,
  getProducts,
  updateProduct,
} from "../controller/product.controller";
import fileUpload from "express-fileupload";

const router = Router();

router.get("/products", getProducts);
router.get("/product/:id", getProductById);
router.get("/products-by-category/:id", getProductByCategory);
router.post(
  "/new-product",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "../uploads",
  }),
  createProduct
);
router.put(
  "/update-product/:id",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "../uploads",
  }),
  updateProduct
);
router.delete("/delete-product/:id", deleteProduct);

export default router;
