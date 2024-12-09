import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { ConfigProvider } from "./contexts/ConfigContext";
import { authenticate } from "./shopify.server";
import prisma from "./db.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  const config = await prisma.configuration.findFirst({
    where: { shop: session?.shop }
  });

  return json({ 
    importFrequency: config?.importFrequency || "manual",
    shop: session?.shop
  });
}

export default function App() {
  const { importFrequency, shop } = useLoaderData();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ConfigProvider 
          initialShop={shop}
          initialImportFrequency={importFrequency}
        >
          <Outlet />
        </ConfigProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
