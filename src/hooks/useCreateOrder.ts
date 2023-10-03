import axios from "axios";
import { PALPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } from "../config";

export const useCreateOrder = async (amount: string): Promise<any | null> => {
  try {
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description: "You bought at Store.com",
        },
      ],
      application_context: {
        brand_name: "Store",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: "http://localhost:3003/capture-order",
        cancel_url: "https://my-store-client.netlify.app",
      },
    };

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const {
      data: { access_token },
    } = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
      auth: {
        username: PALPAL_CLIENT_ID,
        password: PAYPAL_CLIENT_SECRET,
      },
    });

    return await axios
      .post(`${PAYPAL_API}/v2/checkout/orders`, order, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(({ data }) => ({
        orderId: data.id,
        link: data.links.filter(
          (link: { href: string; rel: string; method: string }) =>
            link.rel === "approve"
        ),
      }))
      .catch(() => null);
  } catch (error) {
    if (error instanceof Error) return console.log(error);
  }
};
