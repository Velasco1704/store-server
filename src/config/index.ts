import { config } from "dotenv";
config();

export const PORT = process.env.PORT ?? 3000;
export const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const CLOUD_NAME = process.env.CLOUD_NAME ?? "";
export const API_KEY = process.env.API_KEY ?? "";
export const API_SECRET = process.env.API_SECRET ?? "";
export const PALPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";
export const PAYPAL_API = process.env.PAYPAL_API ?? "";
