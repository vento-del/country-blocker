import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (!topic) {
    return new Response(null, { status: 401 });
  }

  try {
    // Log the data request
    console.log("Received customer data request:", {
      shop: shop,
      customerId: payload.customer.id,
      ordersToRedact: payload.orders_to_redact,
    });

    // In this app, we only store country restrictions in metafields
    // which are managed by Shopify, so we don't need to do anything here
    // Just acknowledge receipt of the request

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing customer data request:", error);
    return new Response(null, { status: 500 });
  }
}; 