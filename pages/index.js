import {
  Page,
  Layout,
  Card,
  Button,
  DataTable,
  Badge
} from '@shopify/polaris';

export default function Home() {
  return (
    <Page title="Quotiza Connect">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h2>Quotiza Sync</h2>
                <p>Enable or disable synchronization with Quotiza</p>
              </div>
              <Button>Enable Sync</Button>
            </div>
          </Card>

          <Card sectioned>
            <h2>Welcome to Quotiza Connect</h2>
            <p>This app helps you synchronize your Shopify products with Quotiza. Follow these steps to get started:</p>
            <ul>
              <li>Go to Settings in the navigation menu</li>
              <li>Enter your Quotiza API Key and Account ID</li>
              <li>Enable synchronization and choose your preferred frequency</li>
            </ul>
          </Card>

          <Card sectioned>
            <h2>Import History</h2>
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text']}
              headings={['Status', 'Date', 'Time', 'Action']}
              rows={[
                [<Badge status="success">Success</Badge>, '2023-06-01', '14:30:00', '-'],
                [<Badge status="critical">Error</Badge>, '2023-05-31', '09:15:00', <Button size="slim">View Errors</Button>]
              ]}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 