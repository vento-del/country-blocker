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
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import CountrySelector from "../components/CountrySelector";
import { useState, useCallback } from "react";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Get shop data from session
  const shop = session.shop;
  
  // In a real implementation, you would check if the shop has an active subscription
  // This is a placeholder - you'll need to implement the actual check based on your billing system
  let hasPlan = false;
  
  try {
    // Example: Check if the shop has an active subscription using Shopify GraphQL API
    // This is a simplified example - you'll need to implement the actual check
    const response = await admin.graphql(
      `#graphql
      query getAppSubscription {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
          }
        }
      }`
    );
    
    const responseJson = await response.json();
    const activeSubscriptions = responseJson.data?.currentAppInstallation?.activeSubscriptions || [];
    
    // If there are any active subscriptions, the shop has a plan
    hasPlan = activeSubscriptions.length > 0;
    
    console.log('Active subscriptions:', activeSubscriptions);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Default to false if there's an error
    hasPlan = false;
  }
  
  return json({
    shop,
    hasPlan
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
  const { shop, hasPlan } = useLoaderData();
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

      // Extract the shop name without .myshopify.com
      const shopName = shop.replace('.myshopify.com', '');
      
      // Construct the URL using admin.shopify.com format
      const embedUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/country_blocker`;
      console.log('Opening URL:', embedUrl);

      // Open in a new tab
      window.open(embedUrl, '_blank');
    } catch (error) {
      console.error('Error opening theme editor:', error);
    }
  }, [shop]);
  
  const handleManagePricingClick = useCallback(() => {
    try {
      // Use the shop from loader data
      if (!shop) {
        console.error('Shop information not available');
        return;
      }

      // Extract the shop name without .myshopify.com
      const shopName = shop.replace('.myshopify.com', '');
      
      // Construct the URL for the pricing plans page
      const pricingUrl = `https://admin.shopify.com/store/${shopName}/charges/insta-18/pricing_plans`;
      console.log('Opening pricing URL:', pricingUrl);

      // Open in a new tab
      window.open(pricingUrl, '_blank');
    } catch (error) {
      console.error('Error opening pricing page:', error);
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
                <InlineStack gap="300" align="end">
                  <Button onClick={handleManagePricingClick} primary>
                    Manage Subscription
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Country Selection
                </Text>
                {!hasPlan && (
                  <Banner status="warning">
                    <Text as="p" variant="bodyMd">
                      You need to select a subscription plan to use this feature.
                    </Text>
                  </Banner>
                )}
                <div style={{ opacity: hasPlan ? 1 : 0.5, pointerEvents: hasPlan ? 'auto' : 'none' }}>
                  <CountrySelector
                    selectedCountries={selectedCountries}
                    onChange={handleCountryChange}
                    disabled={!hasPlan}
                  />
                  {selectedCountries.length > 0 && (
                    <Text as="p" variant="bodySm" color="subdued">
                      {selectedCountries.length} countries selected
                    </Text>
                  )}
                </div>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Theme Integration
                </Text>
                <div style={{ opacity: hasPlan ? 1 : 0.5 }}>
                  <Banner status={hasPlan ? "info" : "warning"}>
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd">
                        {hasPlan 
                          ? "Add the country blocker to your theme:" 
                          : "You need to select a subscription plan to use this feature."}
                      </Text>
                      <Button 
                        onClick={handleEmbedClick} 
                        primary 
                        disabled={!hasPlan}
                      >
                        Open Theme Editor
                      </Button>
                      {hasPlan && (
                        <Text as="p" variant="bodySm" color="subdued">
                          This will open your theme editor where you can add the country blocker block to your store's sections.
                        </Text>
                      )}
                    </BlockStack>
                  </Banner>
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
