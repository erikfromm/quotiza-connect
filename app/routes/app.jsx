import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { ConfigProvider } from "../contexts/ConfigContext";
import { ShopProvider } from "../contexts/ShopContext";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw redirect("/auth/login");
  }

  const searchParams = new URL(request.url).searchParams;

  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
    host: searchParams.get("host"),
    embedded: searchParams.get("embedded") === "1"
  };
};

export default function App() {
  const { apiKey, host, shop, embedded } = useLoaderData();

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
          <NavMenu>
            <Link to={`/app?shop=${shop}`}>Home</Link>
            <Link to={`/app/settings?shop=${shop}`}>Settings</Link>
          </NavMenu>
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
