import { useEffect } from "react";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import CountrySelector from "../components/CountrySelector";
import { useState, useCallback } from "react";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Get shop data from session
  const shop = session.shop;
  
  return json({
    shop
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { shop } = useLoaderData();
  const submit = useSubmit();
  const [selectedCountries, setSelectedCountries] = useState([]);

  const handleCountryChange = useCallback((countries) => {
    console.log("Countries selected:", countries);
    setSelectedCountries(countries);
  }, []);

  const handleEmbedClick = useCallback(() => {
    try {
      // Use the shop from loader data
      if (!shop) {
        console.error('Shop information not available');
        return;
      }

      // Construct the URL using the shop from the session
      const embedUrl = `https://${shop}/admin/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/country_blocker`;
      console.log('Opening URL:', embedUrl);

      // Open directly in a new tab
      window.location.assign(embedUrl);
    } catch (error) {
      console.error('Error opening theme editor:', error);
    }
  }, [shop]);

  return (
    <Page title="Country Restrictions Dashboard">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Welcome to your Country Restrictions Dashboard
                </Text>
                <Text as="p" variant="bodyMd">
                  Use this dashboard to manage which countries can access your store. Select countries below and then embed the blocker in your theme.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Country Selection
                </Text>
                <CountrySelector
                  selectedCountries={selectedCountries}
                  onChange={handleCountryChange}
                />
                {selectedCountries.length > 0 && (
                  <Text as="p" variant="bodySm" color="subdued">
                    {selectedCountries.length} countries selected
                  </Text>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Theme Integration
                </Text>
                <Banner status="info">
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd">
                      Add the country blocker to your theme:
                    </Text>
                    <Button onClick={handleEmbedClick} primary>
                      Open Theme Editor
                    </Button>
                    <Text as="p" variant="bodySm" color="subdued">
                      This will open your theme editor where you can add the country blocker block to your store's sections.
                    </Text>
                  </BlockStack>
                </Banner>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
