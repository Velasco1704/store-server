import axios from "axios";
import { PALPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } from "../config";

export const useCaptureOrder = async (token: string) => {
  try {
    return await axios
      .post(
        `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
        {},
        {
          auth: {
            username: PALPAL_CLIENT_ID,
            password: PAYPAL_CLIENT_SECRET,
          },
        }
      )
      .then(({ data }) => ({ orderId: data.id, payer: data.payer }))
      .catch(() => null);
  } catch (error) {
    if (error instanceof Error) return console.log(error);
  }
};
