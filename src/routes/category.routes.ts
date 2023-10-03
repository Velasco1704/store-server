import { Router } from "express";
import {
  DeleteCategory,
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controller/category.controller";

const router = Router();

router.get("/categories", getCategories);
router.get("/category/:id", getCategoryById);
router.post("/new-category", createCategory);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", DeleteCategory);

export default router;
