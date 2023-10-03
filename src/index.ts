import express from "express";
import cors from "cors";
import { PORT } from "./config/index";
import userRouter from "./routes/user.routes";
import categoryRouter from "./routes/category.routes";
import productRouter from "./routes/product.routes";
import paymentRouter from "./routes/payment.routes";

const app = express();
app.use(express.json());
app.use(cors());

app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(paymentRouter);

app.listen(PORT);
