import { Request, Response } from "express";
import { prisma } from "../lib";
import { UploadedFile } from "express-fileupload";
import {
  useDeleteImage,
  useUpdateImage,
  useUploadImage,
} from "../hooks/cloudinary";
import { useParseToUpperCase } from "../hooks/useParseToUpperCase";

export const getProducts = async (req: Request, res: Response) => {
  try {
    return await prisma.product
      .findMany({ include: { category: true } })
      .then((result) => res.status(200).json({ result }))
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    return await prisma.product
      .findFirst({
        where: { id: req.params.id },
        include: { category: true, order: true },
      })
      .then((result) =>
        !result
          ? res.status(404).json({ error: "product not found" })
          : res.status(200).json({ result })
      )
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getProductByCategory = async (req: Request, res: Response) => {
  try {
    return await prisma.product
      .findMany({
        where: { categoryId: req.params.id },
      })
      .then((result) =>
        !result
          ? res.status(404).json({ error: "product not found" })
          : res.status(200).json({ result })
      )
      .catch((error) => res.status(400).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const foundProduct = await prisma.product.findFirst({
      where: { name: req.body.name },
    });

    if (
      foundProduct ||
      !req.files?.image ||
      !req.body.name ||
      !req.body.price ||
      !req.body.categoryId
    ) {
      return res.status(403).json({ error: "Invalid Credentials body" });
    } else {
      return await useUploadImage(req.files?.image as UploadedFile)
        .then(
          async (res) =>
            await prisma.product
              .create({
                data: {
                  name: useParseToUpperCase(req.body.name),
                  price: +req.body.price,
                  stock: +req.body.stock,
                  image: res.url,
                  publicIdImage: res.public_id,
                  categoryId: req.body.categoryId,
                },
              })
              .catch((error) => res.status(400).json({ error }))
        )
        .then((result) => res.status(200).json({ result }))
        .catch((error) => res.status(400).json({ error }));
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const foundProduct = await prisma.product.findFirst({
      where: { id: req.params.id },
    });

    if (!foundProduct) {
      return res.status(404).json({ message: "not found" });
    } else {
      return await prisma.product
        .update({
          where: { id: foundProduct.id },
          data: !req.files?.image
            ? {
                ...req.body,
                name: useParseToUpperCase(req.body.name) || foundProduct.name,
                price: +req.body.price || foundProduct.price,
                stock: +req.body.stock || foundProduct.stock,
              }
            : {
                ...req.body,
                name: useParseToUpperCase(req.body.name) || foundProduct.name,
                price: +req.body.price || foundProduct.price,
                stock: +req.body.stock || foundProduct.stock,
                image: await useUpdateImage(
                  req.files?.image as UploadedFile,
                  foundProduct.publicIdImage
                ).then((res) => res.url),
              },
        })
        .then((result) => res.status(200).json({ result }))
        .catch((error) => res.status(400).json({ error }));
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const foundProduct = await prisma.product.findFirst({
      where: { id: req.params.id },
    });

    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      await prisma.order
        .deleteMany({ where: { productId: foundProduct.id } })
        .catch((error) => res.status(400).json({ error }));

      await useDeleteImage(foundProduct?.publicIdImage ?? "")
        .then(
          async () =>
            await prisma.product.delete({ where: { id: req.params.id } })
        )
        .then(() => res.status(200).json({ message: "Product Deleted" }))
        .catch((error) => res.status(400).json({ error }));
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};
