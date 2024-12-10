import { useState, useEffect } from "react";
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
  Banner,
  LegacyStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useNavigate, useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useConfig } from "../contexts/ConfigContext";
import { useShop } from "../contexts/ShopContext";
import prisma from "../db.server";
import { ViewIcon, HideIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("Session in Settings loader:", {
    shop: session?.shop,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    searchParams: new URL(request.url).searchParams.toString()
  });

  if (!session?.shop) {
    console.log("No shop found in session, redirecting to login");
    throw redirect("/auth/login");
  }

  const config = await prisma.configuration.findUnique({
    where: { shop: session.shop }
  });

  return json({ 
    shop: session.shop,
    host: new URL(request.url).searchParams.get("host"),
    embedded: new URL(request.url).searchParams.get("embedded") === "1",
    config
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const config = {
    shop: session.shop,
    apiKey: formData.get("apiKey"),
    accountId: formData.get("accountId"),
    importFrequency: formData.get("importFrequency"),
    priceAdjustment: formData.get("priceAdjustment"),
    percentage: formData.get("percentage")
  };

  try {
    await prisma.configuration.upsert({
      where: { shop: session.shop },
      update: config,
      create: config
    });

    return json({ status: "success" });
  } catch (error) {
    console.error("Error saving configuration:", error);
    return json({ status: "error", message: error.message }, { status: 500 });
  }
};

export default function Settings() {
  const navigate = useNavigate();
  const { shop, config } = useLoaderData();
  console.log("Settings render:", { shop, config });
  const [apiKey, setApiKey] = useState(() => config?.apiKey || "");
  const [accountId, setAccountId] = useState(() => config?.accountId || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const { importFrequency, setImportFrequency } = useConfig();

  useEffect(() => {
    if (config?.importFrequency) {
      setImportFrequency(config.importFrequency);
    }
  }, [config, setImportFrequency]);

  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  const showBanner = actionData?.status === "success" || actionData?.status === "error";
  const bannerTitle = actionData?.status === "success" ? "Settings saved" : "Error saving settings";
  const bannerStatus = actionData?.status === "success" ? "success" : "critical";

  // New state for overall adjustment
  const [priceAdjustment, setPriceAdjustment] = useState(() => config?.priceAdjustment || "price_decrease");
  const [percentage, setPercentage] = useState(() => config?.percentage || "");

  return (
    <Page
      backAction={{
        content: "Products",
        onAction: () => navigate("..", { relative: "path" }),
      }}
    >
      <TitleBar title="Settings" displayTitle={false} />
      <BlockStack gap="500">
        {showBanner && (
          <Banner
            title={bannerTitle}
            status={bannerStatus}
            onDismiss={() => {}}
          >
            {actionData?.message || "Your settings have been saved successfully."}
          </Banner>
        )}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">Connection Settings</Text>
                    <Text variant="bodyMd" color="subdued">
                      Your Quotiza API credentials
                    </Text>
                  </BlockStack>
                </Box>
                <Box padding="400">
                  <FormLayout>
                    <TextField
                      label="API Key"
                      name="apiKey"
                      value={apiKey}
                      onChange={setApiKey}
                      autoComplete="off"
                      type={showApiKey ? "text" : "password"}
                      helpText="Find this in your Quotiza dashboard settings"
                      suffix={
                        <Button
                          variant="plain"
                          icon={showApiKey ? HideIcon : ViewIcon}
                          onClick={() => setShowApiKey(!showApiKey)}
                        />
                      }
                    />
                    <TextField
                      label="Account ID"
                      name="accountId"
                      value={accountId}
                      onChange={setAccountId}
                      autoComplete="off"
                      helpText="Your Quotiza account identifier"
                    />
                  </FormLayout>
                </Box>
              </BlockStack>
            </Card>

            <Box paddingBlockStart="400">
              <Card>
                <BlockStack gap="400">
                  <Box padding="400">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h2">Sync Settings</Text>
                      <Text variant="bodyMd" color="subdued">
                        Configure how your products sync with Quotiza
                      </Text>
                    </BlockStack>
                  </Box>
                  <Box padding="400">
                    <Form method="post">
                      <FormLayout>
                        <Select
                          label="Import Frequency"
                          name="importFrequency"
                          options={[
                            {label: "Every hour", value: "hourly"},
                            {label: "Once a day", value: "daily"},
                            {label: "Manual only", value: "manual"}
                          ]}
                          value={importFrequency}
                          onChange={setImportFrequency}
                          helpText="How often should products be synchronized"
                        />
                        
                        <FormLayout.Group condensed>
                          <Box minWidth="200px">
                            <Select
                              label="Overall adjustment"
                              options={[
                                { label: "Price decrease", value: "price_decrease" },
                                { label: "Price increase", value: "price_increase" }
                              ]}
                              value={priceAdjustment}
                              onChange={setPriceAdjustment}
                            />
                          </Box>
                          <Box minWidth="100px" maxWidth="100px">
                            <div style={{ height: '24px' }}></div>
                            <TextField
                              label=""
                              labelHidden
                              value={percentage}
                              onChange={(value) => {
                                const numericValue = value.replace(/[^0-9]/g, '');
                                if (numericValue <= 100) {
                                  setPercentage(numericValue);
                                }
                              }}
                              type="text"
                              prefix={priceAdjustment === "price_decrease" ? "-" : "+"}
                              suffix="%"
                              placeholder="0"
                              align="right"
                              autoComplete="off"
                            />
                          </Box>
                        </FormLayout.Group>

                        <input type="hidden" name="priceAdjustment" value={priceAdjustment} />
                        <input type="hidden" name="percentage" value={percentage} />
                      </FormLayout>
                    </Form>
                  </Box>
                </BlockStack>
              </Card>
            </Box>

            <Box paddingBlockStart="400">
              <Button 
                primary
                submit
                loading={isSaving}
                fullWidth
                tone="success"
              >
                Save Settings
              </Button>
            </Box>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
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