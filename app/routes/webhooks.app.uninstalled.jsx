import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop, session } = await authenticate.webhook(request);

  try {
    // Eliminar la configuración cuando se desinstala la app
    await prisma.configuration.deleteMany({
      where: { shop }
    });

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    if (session) {
      await prisma.session.deleteMany({ where: { shop } });
    }

    return new Response();
  } catch (error) {
    console.error('Error processing app/uninstalled webhook:', error);
    return new Response();
  }
};
