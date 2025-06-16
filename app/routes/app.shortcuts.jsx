import { useState, useCallback, useEffect } from "react";
import { json } from "@remix-run/node";
import { useSubmit, useLoaderData } from "@remix-run/react";
import { 
  Page, 
  Layout, 
  Card, 
  Text, 
  BlockStack, 
  Banner,
  InlineStack,
  SettingToggle,
  Button
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    // Get the shop's metafield for shortcuts toggle state
    const response = await admin.graphql(
      `#graphql
        query {
          shop {
            id
            myshopifyDomain
            metafield(namespace: "shortcuts", key: "enabled") {
              value
            }
          }
        }
      `
    );

    const responseJson = await response.json();
    
    if (responseJson.errors) {
      console.error("GraphQL errors:", responseJson.errors);
      return json({ error: "Failed to fetch metafield", details: responseJson.errors }, { status: 500 });
    }

    const metafield = responseJson.data?.shop?.metafield;
    const shopDomain = responseJson.data?.shop?.myshopifyDomain;
    
    // Default to false if no metafield exists
    let isEnabled = false;
    
    if (metafield) {
      try {
        isEnabled = JSON.parse(metafield.value);
      } catch (parseError) {
        console.error("Error parsing metafield value:", parseError);
      }
    }

    return json({ isEnabled, shopDomain });
  } catch (error) {
    console.error("Error in loader:", error);
    return json({ 
      error: "Failed to fetch Keyboard shortcuts settings", 
      details: error.message 
    }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();
    const isEnabled = formData.get("isEnabled") === "true";

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

    if (responseJson.errors) {
      console.error("GraphQL errors:", responseJson.errors);
      return json({ error: "Failed to get shop ID", details: responseJson.errors }, { status: 500 });
    }

    const shopId = responseJson.data?.shop?.id;
    if (!shopId) {
      console.error("No shop ID found");
      return json({ error: "Failed to get shop ID" }, { status: 500 });
    }

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
              namespace: "shortcuts",
              key: "enabled",
              value: JSON.stringify(isEnabled),
              type: "boolean",
            },
          ],
        },
      }
    );

    const metafieldResponseJson = await metafieldResponse.json();

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
        error: "Failed to save Keyboard shortcuts settings", 
        details: metafieldResponseJson.data.metafieldsSet.userErrors 
      }, { status: 500 });
    }

    return json({ success: true, isEnabled });
  } catch (error) {
    console.error("Error in action:", error);
    return json({ 
      error: "Failed to save keyboardshortcuts settings", 
      details: error.message 
    }, { status: 500 });
  }
};

export default function Shortcuts() {
  const { isEnabled, error, shopDomain } = useLoaderData();
  const [enabled, setEnabled] = useState(isEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, error: null });
  
  const submit = useSubmit();

  // Update local state when loader data changes
  useEffect(() => {
    setEnabled(isEnabled);
  }, [isEnabled]);

  const handleToggle = useCallback(() => {
    const newState = !enabled;
    setEnabled(newState);
    setIsSaving(true);
    setSaveStatus({ success: false, error: null });
    
    const formData = new FormData();
    formData.append("isEnabled", newState.toString());
    
    submit(formData, { method: "post", replace: true });
    
    // Show success message after submission
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus({ success: true, error: null });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ success: false, error: null });
      }, 3000);
    }, 500);
  }, [enabled, submit]);


  const handleEmbedShortcutClick = useCallback(() => {
    try {
      // Use the shop from loader data
      if (!shopDomain) {
        console.error('Shop information not available');
        return;
      }

      // Extract the shop name without .myshopify.com
      const shopName = shopDomain.replace('.myshopify.com', '');
      
      // Construct the URL using admin.shopify.com format
      const embedUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&template=index&activateAppId=d7c3a32f-9572-4caf-aadd-ab0a618f3c30/disable_shortcuts`;
      console.log('Opening URL:', embedUrl);

      // Open in a new tab
      window.open(embedUrl, '_blank');
    } catch (error) {
      console.error('Error opening theme editor:', error);
    }
  }, [shopDomain]);

  return (
    <Page
      title="Disable Keyboard Shortcuts"
      backAction={{
        content: "Back to Dashboard",
        url: "/app",
      }}
    >
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical">
              An error occurred: {error}
            </Banner>
          )}
          
          {saveStatus.success && (
            <Banner status="success">
              Settings saved successfully!
            </Banner>
          )}
          
          {saveStatus.error && (
            <Banner status="critical">
              Failed to save settings: {saveStatus.error}
            </Banner>
          )}
          
          <Card>
            <BlockStack gap="400">
              
              <Text as="p" variant="bodyMd">
              Enable this setting to prevent users from using keyboard shortcuts like Ctrl+C, Ctrl+X, Ctrl+U, and F12 on your website or specific pages.
              
              </Text>
              
              
              
              <SettingToggle
                action={{
                  content: enabled ? "Disable" : "Enable",
                  onAction: handleToggle,
                  loading: isSaving,
                  ...(enabled && {
                    variant: "primary",
                    tone: "success"
                  })
                }}
                enabled={enabled}
              >
                <Text variant="headingMd" as="h6">
                  Disable Keyboard Shortcuts
                </Text>
                <Text variant="bodyMd" as="p">
                  {enabled 
                    ? "Keyboard shortcuts are currently disabled on your website." 
                    : "Enable to disable keyboard shortcuts like Ctrl+C, Ctrl+U, F12 on your website."
                  }
                </Text>
              </SettingToggle>

              <Text as="p" variant="bodyMd">
              This feature helps you enhance security, reduce content copying, and limit access to developer tools.
              
              </Text>
              
              {enabled && (
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Shortcuts Disabled
                  </Text>
                  
                  <Text as="p" variant="bodyMd">
                    The following keyboard shortcuts are now disabled on your website:
                  </Text>
                  
                  <BlockStack gap="200">
                    <Text as="h4" variant="bodySm" fontWeight="bold">Content Protection:</Text>
                    <ul>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+C</strong> (Copy)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+X</strong> (Cut)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+A</strong> (Select All)</Text></li>
                    </ul>
                    
                    <Text as="h4" variant="bodySm" fontWeight="bold">Source Code Protection:</Text>
                    <ul>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+U</strong> (View Source)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+S</strong> (Save Page)</Text></li>
                    </ul>
                    
                    <Text as="h4" variant="bodySm" fontWeight="bold">Developer Tools:</Text>
                    <ul>
                      <li><Text as="span" variant="bodyMd"><strong>F12</strong> (Developer Tools)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+Shift+I</strong> (Inspect Element)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+Shift+J</strong> (JavaScript Console)</Text></li>
                    </ul>
                    
                    <Text as="h4" variant="bodySm" fontWeight="bold">Other Restrictions:</Text>
                    <ul>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+P</strong> (Print)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Shift+F10</strong> (Context Menu)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Right-click</strong> (Context Menu)</Text></li>
                      <li><Text as="span" variant="bodyMd"><strong>Ctrl+R</strong> / <strong>F5</strong> (Reload Page)</Text></li>
                    </ul>
                  </BlockStack>
                </BlockStack>
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
                    <Button onClick={handleEmbedShortcutClick} primary>
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
    </Page>
  );
}