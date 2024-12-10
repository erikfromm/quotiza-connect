import prisma from "../db.server";
import { sendToQuotizaAPI } from "./quotiza.server";

export async function syncProducts(shop, admin) {
  try {
    // 1. Obtener configuración
    const config = await prisma.configuration.findFirst({
      where: { shop }
    });

    if (!config?.apiKey || !config?.accountId) {
      throw new Error("API Key and Account ID are required");
    }

    const { apiKey, accountId } = config;

    // 2. Registrar inicio de sincronización
    const syncRecord = await prisma.syncHistory.create({
      data: {
        status: "in_progress",
        date: new Date()
      }
    });

    // 3. Obtener productos de Shopify
    const products = await admin.graphql(`
      query {
        products(first: 250) {
          edges {
            node {
              id
              title
              descriptionHtml
              vendor
              productCategory {
                productTaxonomyNode {
                  name
                }
              }
              status
              variants(first: 1) {
                edges {
                  node {
                    sku
                    price
                    barcode
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `);

    const productsData = await products.json();
    const shopifyProducts = productsData.data.products.edges.map(edge => edge.node);
    console.log('Shopify Products:', JSON.stringify(shopifyProducts, null, 2));

    // 4. Transformar productos
    const quotizaProducts = shopifyProducts.map(product => {
      const basePrice = parseFloat(product.variants.edges[0]?.node.price);
      let adjustedPrice = basePrice;
      
      if (config.percentage && 
          config.percentage !== "0" && 
          !isNaN(parseFloat(config.percentage))) {
        try {
          const percentageValue = parseFloat(config.percentage);
          if (config.priceAdjustment === "price_increase") {
            adjustedPrice = basePrice * (1 + percentageValue / 100);
          } else {
            adjustedPrice = basePrice * (1 - percentageValue / 100);
          }
        } catch (error) {
          console.warn("Error adjusting price, using base price:", error);
          adjustedPrice = basePrice;
        }
      }

      return {
        name: product.title,
        description: product.descriptionHtml?.replace(/<[^>]*>/g, ''),
        brand: product.vendor || "Default Brand",
        category: product.productCategory?.productTaxonomyNode?.name || "Default Category",
        active: product.status === 'ACTIVE',
        sku: product.variants.edges[0]?.node.sku,
        base_price: adjustedPrice,
        upc: product.variants.edges[0]?.node.barcode,
        image_url: product.images.edges[0]?.node.url
      };
    });
    console.log('Transformed Products for Quotiza:', JSON.stringify(quotizaProducts, null, 2));

    // 5. Enviar a Quotiza
    console.log('Sending to Quotiza with config:', {
      accountId: accountId,
      apiKeyLength: apiKey.length
    });
    const { job_id } = await sendToQuotizaAPI(quotizaProducts, config);
    console.log('Quotiza Response:', { job_id });

    // 6. Actualizar registro de sincronización
    await prisma.syncHistory.update({
      where: { id: syncRecord.id },
      data: {
        status: "success",
        products_count: shopifyProducts.length,
        job_id: job_id.toString()
      }
    });

    return { status: "success" };
  } catch (error) {
    console.error("Sync error:", error);

    // Registrar error
    await prisma.syncHistory.create({
      data: {
        status: "error",
        error: error.message,
        date: new Date()
      }
    });

    return { 
      status: "error",
      message: error.message
    };
  }
}
