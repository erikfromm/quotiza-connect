import { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button
} from '@shopify/polaris';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [language, setLanguage] = useState('en');

  const handleSave = () => {
    console.log('Saving settings:', { apiKey, accountId, frequency, language });
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <FormLayout>
              <TextField
                label="API Key"
                value={apiKey}
                onChange={setApiKey}
                autoComplete="off"
              />
              <TextField
                label="Account ID"
                value={accountId}
                onChange={setAccountId}
                autoComplete="off"
              />
              <Select
                label="Import Frequency"
                options={[
                  {label: 'Hourly', value: 'hourly'},
                  {label: 'Daily', value: 'daily'},
                  {label: 'Manual', value: 'manual'}
                ]}
                value={frequency}
                onChange={setFrequency}
              />
              <Select
                label="Language"
                options={[
                  {label: 'English', value: 'en'},
                  {label: 'Español', value: 'es'}
                ]}
                value={language}
                onChange={setLanguage}
              />
              <Button primary onClick={handleSave}>Save Settings</Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 