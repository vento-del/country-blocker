import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    if (!topic) {
      return new Response(null, { status: 401 });
    }

    // Log the shop deletion request
    console.log("Received shop deletion request:", {
      shop: shop,
      shopId: payload.shop.id,
      shopDomain: payload.shop.domain,
    });

    // In this app, we only store country restrictions in metafields
    // which are managed by Shopify, so we don't need to do anything here
    // Just acknowledge receipt of the request

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing shop deletion request:", error);
    // Return 401 for any authentication/validation errors
    return new Response(null, { status: 401 });
  }
}; 