import { Request, Response } from "express";
import { prisma } from "../lib";
import { useParseToUpperCase } from "../hooks/useParseToUpperCase";
import { useDeleteImages } from "../hooks/cloudinary";

export const getCategories = async (req: Request, res: Response) => {
  try {
    return await prisma.category
      .findMany({ include: { products: true } })
      .then((result) => res.status(200).json({ result }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    return await prisma.category
      .findFirst({ where: { id: req.params.id }, include: { products: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ error: "category not found" })
          : res.json(result)
      )
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const foundCategory = await prisma.category.findFirst({
      where: { name: req.body.name },
    });

    if (foundCategory)
      return res.status(403).json({ message: "The category already exists" });

    return await prisma.category
      .create({
        data: {
          name: useParseToUpperCase(req.body.name),
        },
        include: { products: true },
      })
      .then((result) => res.status(200).json({ result }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const foundCategory = await prisma.category.findFirst({
      where: { id: req.params.id },
    });

    return !foundCategory
      ? res.status(404).json({ message: "not found" })
      : await prisma.category
          .update({
            where: { id: foundCategory.id },
            data: {
              name: useParseToUpperCase(req.body.name),
            },
          })
          .then((result) => res.status(200).json({ result }))
          .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const DeleteCategory = async (req: Request, res: Response) => {
  try {
    const foundProducts = await prisma.product.findMany({
      where: { categoryId: req.params.id },
      include: { order: true },
    });

    if (!foundProducts) return res.status(404).json({ message: "not found" });
    console.log(foundProducts);

    if (foundProducts.length !== 0) {
      useDeleteImages(foundProducts.map((pro) => pro.publicIdImage));

      foundProducts.forEach(
        async (item) =>
          await prisma.order.deleteMany({ where: { productId: item.id } })
      );

      await prisma.product.deleteMany({
        where: { categoryId: req.params.id },
      });
    }
    return await prisma.category
      .delete({ where: { id: req.params.id } })
      .then(() => res.status(200).json({ message: "Category deleted" }))
      .catch(() => res.status(400).json({ error: "Category not found" }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ message: error.message });
  }
};
