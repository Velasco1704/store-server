import { Request, Response } from "express";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useCaptureOrder } from "../hooks/useCaptureOrder";
import { prisma } from "../lib";
import { useParseToUpperCase } from "../hooks/useParseToUpperCase";
import { useUpdateProductStock } from "../hooks/useUpdateProductStock";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { page, pageSize } = req.query;

    if (!pageSize || !page) {
      return await prisma.order
        .findMany({
          include: { product: true },
          orderBy: { name: "asc" },
        })
        .then((result) => res.json({ result }));
    } else {
      return await prisma.order
        .findMany({
          skip: (+page - 1) * +pageSize,
          take: +pageSize,
          include: { product: true },
        })
        .then((result) => res.json({ result, navigation: { page, pageSize } }));
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findFirst({ where: { id: req.params.id }, include: { product: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Order not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrderByPaypalOrderId = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({
        where: { paypalOrderId: req.params.id },
        include: { product: true },
      })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Order not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrdersSent = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({ where: { sent: true }, include: { product: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Orders not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrdersNotSent = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({ where: { sent: false }, include: { product: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Orders not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrdersPaid = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({ where: { paid: true }, include: { product: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Orders not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrdersNotPaid = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({ where: { paid: false }, include: { product: true } })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Orders not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const getOrdersByClientName = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .findMany({
        where: { name: useParseToUpperCase(req.params.name) },
        include: { product: true },
      })
      .then((result) =>
        !result
          ? res.status(404).json({ message: "Orders not found" })
          : res.status(200).json({ result })
      );
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      order,
      amount,
    }: {
      order: {
        name: string;
        lastName: string;
        email: string;
        address: string;
        products: { id: string; amount: number }[];
      };
      amount: number;
    } = req.body;

    if (!order || !amount)
      return res.status(403).json({ message: "order or amount is missing" });

    return await useCreateOrder(`${amount}`)
      .then(async (resultOrder) => {
        await prisma.order
          .createMany({
            data: order.products.map((item) => ({
              name: useParseToUpperCase(order.name),
              lastName: useParseToUpperCase(order.lastName),
              email: order.email,
              address: order.address,
              paypalOrderId: resultOrder.orderId,
              productId: item.id,
              amount: item.amount,
            })),
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: "Error" });
          });
        return resultOrder
          ? res.status(200).json({
              message: "success",
              paymentLink: resultOrder.link[0].href,
            })
          : res.status(403).json({
              message: "Orders reject",
            });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: "Error" });
      });
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const captureOrder = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const foundOrder = await prisma.order.findMany({
      where: { paypalOrderId: token as string },
    });

    if (!foundOrder)
      return res.status(404).json({ message: "Order not found" });

    const amountProducts = foundOrder.map((order) => ({
      productId: order.productId,
      amount: order.amount,
    }));

    const productsStock = await Promise.all(
      foundOrder.map(async (order) => {
        const result = await prisma.product.findFirst({
          where: { id: order.productId },
        });

        if (!result)
          return res.status(404).json({ message: "products not found" });

        return {
          id: result.id,
          stock: result.stock,
        };
      })
    );

    const productUpdateStock = useUpdateProductStock(
      productsStock as { id: string; stock: number }[],
      amountProducts
    );

    if (productUpdateStock.length === 0) {
      await prisma.order
        .deleteMany({
          where: { paypalOrderId: token as string },
        })
        .catch((error) => console.log(error));
      return res.status(403).json({ message: "Invalid Credentials" });
    } else {
      productUpdateStock.forEach(async (product) => {
        await prisma.product
          .update({
            where: { id: product?.id },
            data: { stock: product?.newStock },
          })
          .catch((error) => console.log(error));
      });
    }

    return useCaptureOrder(token as string)
      .then(async (resultCaptureOrder) => {
        if (resultCaptureOrder !== null) {
          await prisma.order
            .updateMany({
              where: { paypalOrderId: token as string },
              data: { paid: true },
            })
            .then((resultOrder) =>
              resultOrder
                ? res.redirect(
                    "https://my-store-client.netlify.app/payment-success"
                  )
                : res.redirect(
                    "https://my-store-client.netlify.app/payment-reject"
                  )
            )
            .catch((error) => console.log(error));
        } else {
          res.status(403).json({ message: "Your pay was reject", paid: false });
        }
      })
      .catch((error) => res.status(403).json({ error }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    return await prisma.order
      .deleteMany({
        where: { paypalOrderId: token as string },
      })
      .then(() => res.json({ message: "Your order was cancel" }))
      .catch((err) => console.log(err));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const foundOrder = await prisma.order.findFirst({
      where: { id: req.params.id },
    });

    if (!foundOrder) {
      return res.status(404).json({ message: "Order not Found" });
    } else if (!foundOrder.paid) {
      return res.status(403).json({ message: "The order is not paid" });
    } else {
      return await prisma.order
        .update({
          where: { id: foundOrder.id },
          data: { sent: req.body.sent },
        })
        .then(() => res.status(200).json({ message: "Order updated" }))
        .catch((err) => console.log(err));
    }
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .delete({ where: { id: req.params.id } })
      .then(() => res.status(200).json({ message: "Order deleted" }))
      .catch(() => res.status(404).json({ message: "Order not found" }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};

export const deleteOrderNotPaid = async (req: Request, res: Response) => {
  try {
    return await prisma.order
      .delete({ where: { id: req.params.id, paid: false } })
      .then(() => res.status(200).json({ message: "Order deleted" }))
      .catch(() => res.status(404).json({ message: "Order not found" }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(500).json({ error: error.message });
  }
};
