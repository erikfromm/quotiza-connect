import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quotiza Sync</CardTitle>
            <Switch />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Enable or disable synchronization with Quotiza
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Quotiza Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This app helps you synchronize your Shopify products with Quotiza. Follow these steps to get started:</p>
          <ol className="list-decimal list-inside mt-4 space-y-2">
            <li>Go to Settings in the navigation menu</li>
            <li>Enter your Quotiza API Key and Account ID</li>
            <li>Enable synchronization and choose your preferred frequency</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                </TableCell>
                <TableCell>2023-06-01</TableCell>
                <TableCell>14:30:00</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">Error</Badge>
                </TableCell>
                <TableCell>2023-05-31</TableCell>
                <TableCell>09:15:00</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">View Errors</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

