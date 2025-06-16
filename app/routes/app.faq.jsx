import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function FAQ() {
  return (
    <Page
      title="Frequently Asked Questions"
      backAction={{
        content: "Back to Dashboard",
        url: "/app",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                General Questions
              </Text>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  What is the Country Blocker app?
                </Text>
                <Text as="p" variant="bodyMd">
                  The Country Blocker app allows you to restrict access to your Shopify store based on customer location. You can select specific countries that you want to block or allow access to your store.
                </Text>

                <Text as="h3" variant="headingSm">
                  How does the country blocking work?
                </Text>
                <Text as="p" variant="bodyMd">
                  The app uses IP geolocation to detect a customer's country. When a customer visits your store, the app checks their location against your allowed/blocked countries list and either allows or denies access accordingly.
                </Text>

                <Text as="h3" variant="headingSm">
                  Can I change my country restrictions at any time?
                </Text>
                <Text as="p" variant="bodyMd">
                  Yes, you can update your country restrictions at any time through the app's dashboard. Changes take effect immediately after saving.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Technical Questions
              </Text>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  How accurate is the country detection?
                </Text>
                <Text as="p" variant="bodyMd">
                  Country detection is based on IP geolocation, which is generally very accurate. However, some users may be using VPNs or proxy servers that could affect the accuracy of location detection.
                </Text>

                <Text as="h3" variant="headingSm">
                  Does the app affect my store's performance?
                </Text>
                <Text as="p" variant="bodyMd">
                  The app is designed to be lightweight and efficient. The country check is performed quickly and should not significantly impact your store's loading time.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Support
              </Text>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  How can I get help if I have issues?
                </Text>
                <Text as="p" variant="bodyMd">
                  If you encounter any issues or have questions, please contact our support team through the Shopify Partner dashboard or email us at ventosupprt@gmail.com.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 