import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function PrivacyPolicy() {
  return (
    <Page
      title="Privacy Policy"
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
                Introduction
              </Text>
              <Text as="p" variant="bodyMd">
                This Privacy Policy describes how the Country Blocker app ("we", "our", or "us") collects, uses, and protects your data. We are committed to protecting your privacy and ensuring the security of your personal information.
              </Text>

              <Text as="h2" variant="headingMd">
                Data Collection and Use
              </Text>
              <BlockStack gap="300">
                <Text as="h3" variant="headingSm">
                  What data we collect
                </Text>
                <Text as="p" variant="bodyMd">
                  We collect and process the following types of data:
                </Text>
                <ul>
                  <li>Store information (shop domain, shop ID)</li>
                  <li>Country restrictions settings</li>
                  <li>Customer IP addresses (for geolocation purposes only)</li>
                  <li>App usage statistics</li>
                </ul>

                <Text as="h3" variant="headingSm">
                  How we use your data
                </Text>
                <Text as="p" variant="bodyMd">
                  We use the collected data to:
                </Text>
                <ul>
                  <li>Provide and maintain the country blocking functionality</li>
                  <li>Improve our app's performance and user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Respond to your support requests</li>
                </ul>
              </BlockStack>

              <Text as="h2" variant="headingMd">
                Data Storage and Security
              </Text>
              <Text as="p" variant="bodyMd">
                We store your data securely using industry-standard encryption and security measures. Your data is stored on Shopify's infrastructure and is protected by their security protocols.
              </Text>

              <Text as="h2" variant="headingMd">
                GDPR Compliance
              </Text>
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  We comply with the General Data Protection Regulation (GDPR) and provide the following rights to our users:
                </Text>
                <ul>
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of your personal data</li>
                  <li>Right to erasure of your personal data</li>
                  <li>Right to restrict processing of your personal data</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing of your personal data</li>
                </ul>
              </BlockStack>

              <Text as="h2" variant="headingMd">
                Data Retention
              </Text>
              <Text as="p" variant="bodyMd">
                We retain your data only for as long as necessary to provide our services and comply with legal obligations. When you uninstall the app, we will delete your data within 30 days.
              </Text>

              <Text as="h2" variant="headingMd">
                Contact Us
              </Text>
              <Text as="p" variant="bodyMd">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
                <br />
                Email: privacy@example.com
              </Text>

              <Text as="h2" variant="headingMd">
                Updates to This Policy
              </Text>
              <Text as="p" variant="bodyMd">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </Text>

              <Text as="p" variant="bodySm" color="subdued">
                Last Updated: {new Date().toLocaleDateString()}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 