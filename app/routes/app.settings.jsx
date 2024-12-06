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
  BlockStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [frequency, setFrequency] = useState("daily");

  const handleSave = () => {
    console.log("Saving settings:", { apiKey, accountId, frequency });
  };

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Quotiza Settings</Text>
              <FormLayout>
                <TextField
                  label="API Key"
                  value={apiKey}
                  onChange={setApiKey}
                  autoComplete="off"
                />
                <TextField
                  label="Account ID"
                  value={accountId}
                  onChange={setAccountId}
                  autoComplete="off"
                />
                <Select
                  label="Import Frequency"
                  options={[
                    {label: "Hourly", value: "hourly"},
                    {label: "Daily", value: "daily"},
                    {label: "Manual", value: "manual"}
                  ]}
                  value={frequency}
                  onChange={setFrequency}
                />
                <Button primary onClick={handleSave}>Save Settings</Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 