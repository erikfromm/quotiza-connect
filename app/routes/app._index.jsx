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
import { useNavigate, redirect, useActionData, useNavigation, Form, useSubmit, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { RefreshIcon } from "@shopify/polaris-icons";
import { useConfig } from "../contexts/ConfigContext";
import { useShop } from "../contexts/ShopContext";
import { syncProducts } from "../services/sync.server";
import { checkImportStatus } from "../services/quotiza.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw redirect("/auth/login");
  }

  // Obtener historial de sincronización
  const syncHistory = await prisma.syncHistory.findMany({
    orderBy: { date: 'desc' },
    take: 10
  });

  return json({ 
    shop: session.shop,
    syncHistory 
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "check_status") {
    const jobId = formData.get("jobId");
    const config = await prisma.configuration.findUnique({
      where: { id: "current" }
    });

    const status = await checkImportStatus(jobId, config);
    return json(status);
  }
  
  try {
    const result = await syncProducts(session.shop, admin);
    return json(result);
  } catch (error) {
    return json({ 
      status: "error", 
      message: error.message 
    }, { status: 500 });
  }
};

export default function Index() {
  const { importFrequency } = useConfig();
  const shop = useShop();
  const { syncHistory } = useLoaderData();
  const isAutoSyncEnabled = ["hourly", "daily"].includes(importFrequency);
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSyncing = navigation.state === "submitting";
  const submit = useSubmit();

  const [errorModalActive, setErrorModalActive] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const inProgressRecord = syncHistory.find(record => record.job_id && record.status === "in_progress");
    if (inProgressRecord) {
      const checkStatus = async () => {
        setCheckingStatus(true);
        const formData = new FormData();
        formData.append("action", "check_status");
        formData.append("jobId", inProgressRecord.job_id);
        await submit(formData, { method: "post" });
        setCheckingStatus(false);
      };
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [syncHistory]);

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
                      onClick={() => submit(null, { method: "post" })}
                      icon={RefreshIcon}
                      loading={isSyncing}
                      disabled={isSyncing}
                    >
                      {isSyncing ? "Syncing..." : "Sync Now"}
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
                      rows={syncHistory.map(record => [
                        <Badge tone={record.status === "success" ? "success" : "critical"}>
                          {record.status}
                        </Badge>,
                        new Date(record.date).toLocaleDateString(),
                        new Date(record.date).toLocaleTimeString(),
                        record.error ? (
                          <Button variant="plain" size="slim" onClick={() => {
                            setSelectedError({
                              date: new Date(record.date).toLocaleDateString(),
                              time: new Date(record.date).toLocaleTimeString(),
                              errors: [record.error]
                            });
                            setErrorModalActive(true);
                          }}>
                            View Errors
                          </Button>
                        ) : (
                          record.products_count ? `${record.products_count} products` : "-"
                        )
                      ])}
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
