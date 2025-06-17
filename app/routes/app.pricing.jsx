import { useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Page, Layout, Card, Text, BlockStack, Spinner } from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Get shop data from session
  const shop = session.shop;
  
  // Extract the shop name without .myshopify.com
  const shopName = shop.replace('.myshopify.com', '');
  
  // Construct the URL for the pricing plans page
  const pricingUrl = `https://admin.shopify.com/store/${shopName}/charges/insta-18/pricing_plans`;
  
  return json({ 
    shop,
    pricingUrl
  });
};

export default function PricingRedirect() {
  const { pricingUrl } = useLoaderData();
  
  useEffect(() => {
    // Redirect to the pricing URL after a short delay
    const timer = setTimeout(() => {
      window.location.href = pricingUrl;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [pricingUrl]);
  
  return (
    <Page title="Redirecting to Pricing Plans">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400" alignment="center">
              <Text as="h2" variant="headingMd">
                Redirecting to Pricing Plans...
              </Text>
              <Spinner size="large" />
              <Text as="p" variant="bodyMd">
                You will be redirected to the pricing plans page in a moment.
              </Text>
              <Text as="p" variant="bodyMd">
                If you are not redirected automatically, please{" "}
                <a href={pricingUrl} target="_blank" rel="noopener noreferrer">
                  click here
                </a>
                .
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}