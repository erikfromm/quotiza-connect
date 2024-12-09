import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { ConfigProvider } from "../contexts/ConfigContext";
import { ShopProvider } from "../contexts/ShopContext";
import prisma from "../db.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw redirect("/auth/login");
  }

  const searchParams = new URL(request.url).searchParams;

  const config = await prisma.configuration.findFirst({
    where: { shop: session?.shop }
  });

  return json({ 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
    host: searchParams.get("host"),
    embedded: searchParams.get("embedded") === "1",
    config
  });
};

export default function App() {
  const { apiKey, host, shop, embedded, config } = useLoaderData();

  return (
    <AppProvider 
      isEmbeddedApp 
      apiKey={apiKey}
      host={host}
      shop={shop}
      forceRedirect={!embedded}
    >
      <ShopProvider shop={shop}>
        <ConfigProvider initialShop={shop}>
          <ui-nav-menu>
            <a href="/app">Home</a>
            <a href="/app/settings">Settings</a>
            <a 
              href="https://app.quotiza.com/products"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://app.quotiza.com/products', '_blank', 'noopener,noreferrer');
              }}
            >
              Open Quotiza
              <span style={{ marginLeft: '4px', fontSize: '14px' }}>↗</span>
            </a>
          </ui-nav-menu>
          <Outlet />
        </ConfigProvider>
      </ShopProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
