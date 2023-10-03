import { Router } from "express";
import {
  cancelOrder,
  captureOrder,
  createOrder,
  deleteOrder,
  getOrdersByClientName,
  getOrderById,
  getOrderByPaypalOrderId,
  getOrders,
  getOrdersNotPaid,
  getOrdersNotSent,
  getOrdersPaid,
  getOrdersSent,
  updateOrder,
  deleteOrderNotPaid,
} from "../controller/payment.controller";

export const router = Router();

router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);
router.get("/order-paypal/:id", getOrderByPaypalOrderId);
router.get("/orders-sent", getOrdersSent);
router.get("/orders-not-sent", getOrdersNotSent);
router.get("/orders-paid", getOrdersPaid);
router.get("/orders-not-paid", getOrdersNotPaid);
router.get("/orders-client-name/:name", getOrdersByClientName);
router.post("/create-order", createOrder);
router.get("/capture-order", captureOrder);
router.get("/cancel-order", cancelOrder);
router.put("/update-order/:id", updateOrder);
router.delete("/delete-order/:id", deleteOrder);
router.delete("/delete-order-not-paid/:id", deleteOrderNotPaid);

export default router;
