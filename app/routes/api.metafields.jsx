import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    console.log("Authenticated successfully");

    // Get the shop's metafield for allowed countries
    const response = await admin.graphql(
      `#graphql
        query {
          shop {
            id
            metafield(namespace: "countryselector", key: "selected-country") {
              value
            }
          }
        }
      `
    );

    const responseJson = await response.json();
    console.log("Metafield fetch response:", responseJson);
    
    if (responseJson.errors) {
      console.error("GraphQL errors:", responseJson.errors);
      return json({ error: "Failed to fetch metafield", details: responseJson.errors }, { status: 500 });
    }

    const metafield = responseJson.data?.shop?.metafield;
    
    if (!metafield) {
      console.log("No metafield found, returning empty array");
      return json({ allowedCountries: [] });
    }

    try {
      const parsedValue = JSON.parse(metafield.value);
      console.log("Parsed metafield value:", parsedValue);
      return json({ allowedCountries: parsedValue });
    } catch (parseError) {
      console.error("Error parsing metafield value:", parseError);
      return json({ allowedCountries: [] });
    }
  } catch (error) {
    console.error("Error in loader:", error);
    return json({ 
      error: "Failed to fetch allowed countries", 
      details: error.message 
    }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    console.log("Authenticated successfully for action");

    const formData = await request.formData();
    const countries = JSON.parse(formData.get("countries"));
    console.log("Received countries to save:", countries);

    // Get the shop ID
    const response = await admin.graphql(
      `#graphql
        query {
          shop {
            id
          }
        }
      `
    );

    const responseJson = await response.json();
    console.log("Shop query response:", responseJson);

    if (responseJson.errors) {
      console.error("GraphQL errors:", responseJson.errors);
      return json({ error: "Failed to get shop ID", details: responseJson.errors }, { status: 500 });
    }

    const shopId = responseJson.data?.shop?.id;
    if (!shopId) {
      console.error("No shop ID found");
      return json({ error: "Failed to get shop ID" }, { status: 500 });
    }

    console.log("Shop ID:", shopId);

    // Create or update the metafield
    const metafieldResponse = await admin.graphql(
      `#graphql
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          metafields: [
            {
              ownerId: shopId,
              namespace: "countryselector",
              key: "selected-country",
              value: JSON.stringify(countries),
              type: "json",
            },
          ],
        },
      }
    );

    const metafieldResponseJson = await metafieldResponse.json();
    console.log("Metafield save response:", metafieldResponseJson);

    if (metafieldResponseJson.errors) {
      console.error("GraphQL errors:", metafieldResponseJson.errors);
      return json({ 
        error: "Failed to save metafield", 
        details: metafieldResponseJson.errors 
      }, { status: 500 });
    }

    if (metafieldResponseJson.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafield save errors:", metafieldResponseJson.data.metafieldsSet.userErrors);
      return json({ 
        error: "Failed to save allowed countries", 
        details: metafieldResponseJson.data.metafieldsSet.userErrors 
      }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in action:", error);
    return json({ 
      error: "Failed to save allowed countries", 
      details: error.message 
    }, { status: 500 });
  }
}; 