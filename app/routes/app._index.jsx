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
  Link,
  Icon
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate, redirect, useActionData, useNavigation, useSubmit, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { RefreshIcon, ExternalIcon } from "@shopify/polaris-icons";
import { useConfig } from "../contexts/ConfigContext";
import { useShop } from "../contexts/ShopContext";
import { syncProducts } from "../services/sync.server";
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

  // Obtener la configuración actual
  const config = await prisma.configuration.findFirst({
    where: { shop: session.shop }
  });

  return json({ 
    shop: session.shop,
    syncHistory,
    importFrequency: config?.importFrequency || "manual",
    config
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  const result = await syncProducts(session.shop, admin);
  return json(result);
};

export default function Index() {
  const { importFrequency, setImportFrequency } = useConfig();
  const shop = useShop();
  const { syncHistory, importFrequency: initialImportFrequency, config } = useLoaderData();
  const navigation = useNavigation();
  const isAutoSyncEnabled = ["hourly", "daily"].includes(importFrequency);
  const isSyncing = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";
  const submit = useSubmit();

  const [errorModalActive, setErrorModalActive] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const navigate = useNavigate();
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  // Actualizar el estado del contexto con el valor de la base de datos
  useEffect(() => {
    setImportFrequency(initialImportFrequency);
  }, [initialImportFrequency]);

  const getBadgeText = () => {
    switch (importFrequency || initialImportFrequency) {
      case 'hourly':
        return 'Hourly';
      case 'daily':
        return 'Daily';
      default:
        return 'OFF';
    }
  };

  // Función para realizar la sincronización automática
  const performAutoSync = async () => {
    try {
      await submit(null, { method: "post" });
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Error en sincronización automática:', error);
    }
  };

  // Efecto para manejar la sincronización automática
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const checkAndSync = () => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTime;
      
      // Convertir la frecuencia a milisegundos
      const syncInterval = importFrequency === 'hourly' 
        ? 60 * 60 * 1000  // 1 hora
        : 24 * 60 * 60 * 1000;  // 24 horas

      if (timeSinceLastSync >= syncInterval) {
        performAutoSync();
      }
    };

    // Verificar cada 5 minutos
    const intervalId = setInterval(checkAndSync, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [importFrequency, isAutoSyncEnabled, lastSyncTime]);

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
                          size="small"
                          progress={isLoading ? "partiallyComplete" : "complete"}
                        >
                          {isLoading ? "..." : getBadgeText()}
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
