import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
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
    
    const metafield = responseJson.data.shop.metafield;
    
    return json({
      allowedCountries: metafield ? JSON.parse(metafield.value) : []
    });
  } catch (error) {
    console.error("Error fetching metafield:", error);
    return json({ error: "Failed to fetch allowed countries" }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const countries = JSON.parse(formData.get("countries") as string);
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
    const shopId = responseJson.data.shop.id;
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

    if (metafieldResponseJson.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error("Metafield save errors:", metafieldResponseJson.data.metafieldsSet.userErrors);
      return json({ 
        error: "Failed to save allowed countries", 
        details: metafieldResponseJson.data.metafieldsSet.userErrors 
      }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error saving metafield:", error);
    return json({ error: "Failed to save allowed countries" }, { status: 500 });
  }
}; 