import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  DataTable
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const [syncEnabled, setSyncEnabled] = useState(false);

  return (
    <Page>
      <TitleBar title="Quotiza Connect" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <div>
                    <Text variant="headingMd">Quotiza Sync</Text>
                    <Text variant="bodyMd" color="subdued">
                      Enable or disable synchronization with Quotiza
                    </Text>
                  </div>
                  <Button 
                    onClick={() => setSyncEnabled(!syncEnabled)}
                    primary={syncEnabled}
                  >
                    {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd">Import History</Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Status", "Date", "Time", "Action"]}
                  rows={[
                    [
                      <Badge status="success">Success</Badge>,
                      "2023-06-01",
                      "14:30:00",
                      "-"
                    ],
                    [
                      <Badge status="critical">Error</Badge>,
                      "2023-05-31",
                      "09:15:00",
                      <Button size="slim">View Errors</Button>
                    ]
                  ]}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
