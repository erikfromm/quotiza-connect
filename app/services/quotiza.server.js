export async function sendToQuotizaAPI(products, config) {
  const { apiKey, accountId } = config;
  const endpoint = `https://app.quotiza.com/api/v1/products/import`;
  console.log('Quotiza API Request:', {
    endpoint,
    productsCount: products.length,
    firstProduct: products[0]
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        account_id: accountId,
        products: products
      })
    });

    const responseData = await response.json();
    console.log('Quotiza API Response:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    });

    if (!response.ok) {
      const error = responseData;
      throw new Error(error.error?.message || 'Error sending products to Quotiza');
    }

    return responseData;
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