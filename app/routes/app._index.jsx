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
  await authenticate.admin(request);

  return json({
    // Add any data you want to pass to the component
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
  const data = useLoaderData();
  const submit = useSubmit();
  const [selectedCountries, setSelectedCountries] = useState([]);

  const handleCountryChange = useCallback((countries) => {
    console.log("Countries selected:", countries); // Debug log
    setSelectedCountries(countries);
  }, []);

  const handleEmbedClick = useCallback(() => {
    // Get the current URL
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl); // Debug log

    // Try to get shop name from the current URL
    const shopMatch = currentUrl.match(/https:\/\/([^.]+)\.myshopify\.com/);
    console.log("Shop match:", shopMatch); // Debug log

    if (shopMatch) {
      const shopName = shopMatch[1];
      const embedUrl = `https://${shopName}.myshopify.com/admin/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/country_blocker`;
      console.log("Opening URL:", embedUrl); // Debug log
      
      // Try to open the URL
      try {
        window.open(embedUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error("Error opening URL:", error);
        // Fallback: try to redirect in the same window
        window.location.href = embedUrl;
      }
    } else {
      // If we can't get the shop name from the current URL, try to get it from the hostname
      const hostname = window.location.hostname;
      console.log("Hostname:", hostname); // Debug log
      
      const hostnameMatch = hostname.match(/([^.]+)\.myshopify\.com/);
      if (hostnameMatch) {
        const shopName = hostnameMatch[1];
        const embedUrl = `https://${shopName}.myshopify.com/admin/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/country_blocker`;
        console.log("Opening URL (from hostname):", embedUrl); // Debug log
        window.open(embedUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.error('Could not determine shop name from URL or hostname');
      }
    }
  }, []);

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
