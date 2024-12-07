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
  DataTable,
  Box,
  CalloutCard,
  Modal,
  List,
  Icon
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "@remix-run/react";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useConfig } from "../contexts/ConfigContext";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const { importFrequency } = useConfig();
  const isAutoSyncEnabled = ["hourly", "daily"].includes(importFrequency);

  const handleManualSync = () => {
    console.log("Ejecutando sincronización manual");
  };

  const [errorModalActive, setErrorModalActive] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const navigate = useNavigate();

  // Simulación de datos de error
  const errorDetails = {
    date: "2023-05-31",
    time: "09:15:00",
    errors: [
      "Product 'SKU123' failed to sync: Invalid price format",
      "Product 'SKU456' failed to sync: Missing required field 'brand'",
      "Connection timeout after 30 seconds"
    ]
  };

  const handleViewErrors = () => {
    setSelectedError(errorDetails);
    setErrorModalActive(true);
  };

  // Función para obtener el texto del badge
  const getBadgeText = () => {
    switch (importFrequency) {
      case "hourly":
        return "Hourly";
      case "daily":
        return "Daily";
      default:
        return "OFF";
    }
  };

  return (
    <Page>
      <TitleBar title="Quotiza Connect" displayTitle={false} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              {/* Welcome Callout */}
              <CalloutCard
                title="Welcome to Quotiza Connect"
                illustration="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                primaryAction={{
                  content: 'Go to Settings',
                  onAction: () => navigate("/app/settings"),
                }}
              >
                <BlockStack gap="400">
                  <Text variant="bodyMd" as="p">
                    This app helps you synchronize your Shopify products with Quotiza.
                  </Text>
                  
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Follow these steps to get started:</Text>
                    <Text variant="bodyMd" as="p">1. Go to Settings in the navigation menu</Text>
                    <Text variant="bodyMd" as="p">2. Enter your Quotiza API Key and Account ID</Text>
                    <Text variant="bodyMd" as="p">3. Enable synchronization and choose your preferred frequency</Text>
                  </BlockStack>
                </BlockStack>
              </CalloutCard>

              {/* Sync Toggle Card */}
              <Card>
                <Box padding="400">
                  <InlineStack align="space-between">
                    <BlockStack gap="200">
                      <InlineStack gap="200" align="start">
                        <Text variant="headingMd" as="h2">Quotiza Sync</Text>
                        <Badge
                          tone={isAutoSyncEnabled ? "info" : undefined}
                          progress="complete"
                          size="small"
                        >
                          {getBadgeText()}
                        </Badge>
                      </InlineStack>
                      <Text variant="bodyMd" color="subdued">
                        Enable or disable synchronization with Quotiza
                      </Text>
                    </BlockStack>
                    <Button 
                      onClick={handleManualSync}
                      icon={RefreshIcon}
                    >
                      Sync
                    </Button>
                  </InlineStack>
                </Box>
              </Card>

              {/* Import History Card */}
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    <Text variant="headingMd" as="h2">Import History</Text>
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text"]}
                      headings={["Status", "Date", "Time", "Action"]}
                      rows={[
                        [
                          <Badge tone="success">Success</Badge>,
                          "2023-06-01",
                          "14:30:00",
                          "-"
                        ],
                        [
                          <Badge tone="critical">Error</Badge>,
                          "2023-05-31",
                          "09:15:00",
                          <Button variant="plain" size="slim" onClick={handleViewErrors}>
                            View Errors
                          </Button>
                        ]
                      ]}
                    />
                  </BlockStack>
                </Box>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal
        open={errorModalActive}
        onClose={() => setErrorModalActive(false)}
        title="Sync Errors"
        primaryAction={{
          content: "Close",
          onAction: () => setErrorModalActive(false),
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">
              The following errors occurred during synchronization on {selectedError?.date} at {selectedError?.time}:
            </Text>
            <List type="bullet">
              {selectedError?.errors.map((error, index) => (
                <List.Item key={index}>{error}</List.Item>
              ))}
            </List>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
