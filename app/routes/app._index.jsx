import { useEffect } from "react";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Navigation,
  Button,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
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
  const [showEmbedInfo, setShowEmbedInfo] = useState(false);

  const handleCountryChange = useCallback((countries) => {
    setSelectedCountries(countries);
    setShowEmbedInfo(true);
  }, []);

  const handleEmbedClick = useCallback(() => {
    const shopName = window.location.hostname.split('.')[0];
    const embedUrl = `https://${shopName}.myshopify.com/admin/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/country_blocker`;
    window.open(embedUrl, '_blank');
  }, []);

  return (
    <Page
      title="Country Restrictions Dashboard"
      navigation={
        <Navigation location="/">
          <Navigation.Section
            items={[
              {
                label: "Dashboard",
                url: "/app",
                selected: true,
              },
              {
                label: "FAQ",
                url: "/faq",
                selected: false,
              },
              {
                label: "Privacy Policy",
                url: "/privacy-policy",
                selected: false,
              },
            ]}
          />
        </Navigation>
      }
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Welcome to your Country Restrictions Dashboard
                </Text>
                <Text as="p" variant="bodyMd">
                  Use this dashboard to manage which countries can access your store.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <CountrySelector
              selectedCountries={selectedCountries}
              onChange={handleCountryChange}
            />
            {showEmbedInfo && (
              <Banner status="info">
                <BlockStack gap="300">
                  <Text as="p" variant="bodyMd">
                    To embed the country blocker in your theme:
                  </Text>
                  <Button onClick={handleEmbedClick}>
                    Open Theme Editor
                  </Button>
                  <Text as="p" variant="bodySm" color="subdued">
                    This will open your theme editor where you can add the country blocker block to your store's sections.
                  </Text>
                </BlockStack>
              </Banner>
            )}
          </Layout.Section>
          <Layout.Section>
           
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
