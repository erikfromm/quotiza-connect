import { useState } from "react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Text,
  BlockStack,
  Box,
  InlineStack,
  Banner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "@remix-run/react";
import { useConfig } from "../contexts/ConfigContext";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const { importFrequency, setImportFrequency } = useConfig();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulamos guardado
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Page
      backAction={{
        content: "Products",
        onAction: () => navigate("/app"),
      }}
    >
      <TitleBar title="Settings" displayTitle={false} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">Quotiza Settings</Text>
                    <Text variant="bodyMd" color="subdued">
                      Configure your connection details and sync preferences
                    </Text>
                  </BlockStack>
                </Box>
                <Box padding="400">
                  <FormLayout>
                    <TextField
                      label="API Key"
                      value={apiKey}
                      onChange={setApiKey}
                      autoComplete="off"
                      helpText="Find this in your Quotiza dashboard settings"
                    />
                    <TextField
                      label="Account ID"
                      value={accountId}
                      onChange={setAccountId}
                      autoComplete="off"
                      helpText="Your Quotiza account identifier"
                    />
                    <Select
                      label="Import Frequency"
                      options={[
                        {label: "Every hour", value: "hourly"},
                        {label: "Once a day", value: "daily"},
                        {label: "Manual only", value: "manual"}
                      ]}
                      value={importFrequency}
                      onChange={setImportFrequency}
                      helpText="How often should products be synchronized"
                    />
                    <Box paddingBlockStart="400">
                      <Button 
                        primary 
                        onClick={handleSave}
                        loading={isSaving}
                        fullWidth
                      >
                        Save Settings
                      </Button>
                    </Box>
                  </FormLayout>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Box padding="400">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h2">Connection Status</Text>
                      <Banner status="success" title="Connected to Quotiza">
                        Your connection is active and working properly
                      </Banner>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Box padding="400">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h2">Need Help?</Text>
                      <Text variant="bodyMd" as="p">
                        Visit our documentation or contact support if you need assistance.
                      </Text>
                      <InlineStack wrap={false} gap="300">
                        <Button variant="plain" url="https://docs.quotiza.com">
                          Documentation
                        </Button>
                        <Button variant="plain" url="mailto:support@quotiza.com">
                          Contact Support
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
} 