import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    if (!topic) {
      console.error("No topic in webhook request");
      return new Response(null, { status: 401 });
    }

    console.log(`Received ${topic} webhook for ${shop}`);

    switch (topic) {
      case "customers/data_request":
        console.log("Processing customer data request:", {
          shop,
          customerId: payload.customer.id,
          ordersRequested: payload.orders_requested,
        });
        break;

      case "customers/redact":
        console.log("Processing customer redaction request:", {
          shop,
          customerId: payload.customer.id,
          ordersToRedact: payload.orders_to_redact,
        });
        break;

      case "shop/redact":
        console.log("Processing shop redaction request:", {
          shop,
          shopId: payload.shop_id,
        });
        break;

      default:
        console.warn(`Unhandled compliance webhook topic: ${topic}`);
    }

    // Return 200 to acknowledge receipt
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error processing ${request.headers.get("X-Shopify-Topic")} webhook:`, error);
    // Return 401 for any authentication/validation errors
    return new Response(null, { status: 401 });
  }
}; 