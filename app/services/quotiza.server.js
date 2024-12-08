export async function sendToQuotizaAPI(products, config) {
  const { apiKey, accountId } = config;
  const endpoint = `https://app.quotiza.com/api/v1/products/import`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        account_id: accountId,
        products: products.map(p => ({
          sku: p.sku,
          name: p.name,
          description: p.description,
          cost: p.base_price,
          brand: p.brand,
          category: p.category,
          active: p.active,
          image_url: p.image_url
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error sending products to Quotiza');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in Quotiza API:', error);
    throw error;
  }
}

export async function checkImportStatus(jobId, config) {
  const { apiKey, accountId } = config;
  const endpoint = `https://app.quotiza.com/api/v1/products/import_status?account_id=${accountId}&job_id=${jobId}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error checking import status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking import status:', error);
    throw error;
  }
} 