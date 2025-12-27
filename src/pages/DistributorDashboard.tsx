import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import { BarChart3, Download, Package, Receipt, Truck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_API_BASE || 'https://tracebloom-backend-2.onrender.com';

/* =========================
   Types
========================= */
interface Batch {
  batchId: string;
  cropType?: string;
  quantity: number;
  location?: string;
  status: string;
  harvestDate?: string;
  farmerName?: string;
}

interface Payment {
  id: string;
  batchId: string;
  amount: number;
  status: string;
  createdAt: string;
  farmerWallet: string;
}

interface Shipment {
  id: string;
  createdAt: string;
  batch: {
    batchId: string;
    cropType?: string;
    quantity: number;
    location?: string;
    status: string;
  };
  consumer: {
    email: string;
  };
}

/* =========================
   Component
========================= */
const DistributorDashboard = () => {
  const [distributorName, setDistributorName] = useState(
    localStorage.getItem('user-name') || ''
  );
  const [distributorEmail, setDistributorEmail] = useState(
    localStorage.getItem('user-email') || ''
  );

  const [batches, setBatches] = useState<Batch[]>([]);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  /* =========================
     Analytics state
  ========================= */
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');
  const [year, setYear] = useState(new Date().getFullYear());
  const chartRef = useRef<HTMLDivElement>(null);

  /* =========================
     Ensure distributor info
  ========================= */
  const ensureDistributorInfo = async () => {
    let name = distributorName;
    let email = distributorEmail;

    if (!name || !email) {
      name = prompt('Enter your name:') || '';
      email = prompt('Enter your email:') || '';

      if (!name.trim() || !email.trim()) {
        toast.error('Name and email are required');
        return null;
      }

      localStorage.setItem('user-name', name);
      localStorage.setItem('user-email', email);
      setDistributorName(name);
      setDistributorEmail(email);
    }

    return { name, email };
  };

  /* =========================
     Fetch incoming batches
  ========================= */
  const fetchBatches = async () => {
    if (!distributorEmail) return;

    try {
      setLoadingBatches(true);
      const res = await fetch(
        `${BACKEND_URL}/api/distributor/${encodeURIComponent(
          distributorEmail
        )}/batches`
      );

      if (!res.ok) throw new Error('Failed');

      const data: Batch[] = await res.json();

      const withNames = data.map((b, i) => ({
        ...b,
        cropType: b.cropType || `Batch #${i + 1}`,
      }));

      setBatches(withNames);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  /* =========================
     Fetch transactions
  ========================= */
  const fetchTransactions = async () => {
    if (!distributorEmail) return;

    try {
      setLoadingTransactions(true);
      const res = await fetch(
        `${BACKEND_URL}/api/distributor/${encodeURIComponent(
          distributorEmail
        )}/transactions`
      );

      if (!res.ok) throw new Error('Failed');

      const data: Payment[] = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  /* =========================
     Accept batch
  ========================= */
  const handleAccept = async (batchId: string) => {
    const info = await ensureDistributorInfo();
    if (!info) return;

    const res = await fetch(`${BACKEND_URL}/api/distributor/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        distributorEmail: info.email,
        distributorName: info.name,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success('Batch accepted');
      fetchBatches();
      fetchTransactions();
    } else {
      toast.error(result.error || 'Failed to accept batch');
    }
  };

  /* =========================
     Reject batch
  ========================= */
  const handleReject = async (batchId: string) => {
    const info = await ensureDistributorInfo();
    if (!info) return;

    const res = await fetch(`${BACKEND_URL}/api/distributor/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        distributorEmail: info.email,
        distributorName: info.name,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success('Batch rejected');
      fetchBatches();
    } else {
      toast.error(result.error || 'Failed to reject batch');
    }
  };

  /* =========================
     Load data
  ========================= */
  useEffect(() => {
    if (distributorEmail) {
      fetchBatches();
      fetchTransactions();
    }
  }, [distributorEmail]);

  /* =========================
     📊 Analytics: Month vs Orders
  ========================= */
  const monthlyOrders = useMemo(() => {
    const map: Record<string, number> = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const key = d.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([month, orders]) => ({
      month,
      orders,
    }));
  }, [transactions]);

  /* =========================
     Available years
  ========================= */
  const availableYears = useMemo(() => {
  const years = new Set<number>();

  transactions.forEach((t) =>
    years.add(new Date(t.createdAt).getFullYear())
  );

  shipments.forEach((s) =>
    years.add(new Date(s.createdAt).getFullYear())
  );

  return Array.from(years).sort();
}, [transactions, shipments]);


  /* =========================
     Monthly analytics
  ========================= */
  

  /* =========================
     KPIs
  ========================= */
  const totalOrders = transactions.length;


const totalRevenue = shipments.reduce(
  (sum, s) => sum + s.batch.quantity * 10,
  0
);

const avgOrder =
  totalOrders === 0 ? 0 : Math.round(totalRevenue / totalOrders);


    /* =========================
     Export chart
  ========================= */
  const exportChart = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.download = `analytics-${year}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  
  /* =========================
     UI
  ========================= */

  const fetchShipments = async () => {
  if (!distributorEmail) return;

  try {
    setLoadingShipments(true);
    const res = await fetch(
      `${BACKEND_URL}/api/distributor/${encodeURIComponent(
        distributorEmail
      )}/shipments`
    );

    if (!res.ok) throw new Error('Failed');

    const data = await res.json();
    setShipments(data);
  } catch (err) {
    console.error(err);
    toast.error('Failed to fetch shipments');
  } finally {
    setLoadingShipments(false);
  }
};

useEffect(() => {
  if (distributorEmail) {
    fetchBatches();
    fetchTransactions();
    fetchShipments();
  }
}, [distributorEmail]);

const monthlyDistributorOrders = useMemo(() => {
  const map: Record<number, number> = {};

  for (let i = 0; i < 12; i++) map[i] = 0;

  transactions.forEach((tx) => {
    const d = new Date(tx.createdAt);
    if (d.getFullYear() !== year) return;

    map[d.getMonth()] += 1;
  });

  return Object.entries(map).map(([m, count]) => ({
    month: new Date(0, Number(m)).toLocaleString('default', { month: 'short' }),
    value: count,
  }));
}, [transactions, year]);


const monthlyConsumerRevenue = useMemo(() => {
  const map: Record<number, number> = {};

  for (let i = 0; i < 12; i++) map[i] = 0;

  shipments.forEach((s) => {
    const d = new Date(s.createdAt);
    if (d.getFullYear() !== year) return;

    // you can replace this with real order value later
    const estimatedRevenue = s.batch.quantity * 10;

    map[d.getMonth()] += estimatedRevenue;
  });

  return Object.entries(map).map(([m, revenue]) => ({
    month: new Date(0, Number(m)).toLocaleString('default', { month: 'short' }),
    value: revenue,
  }));
}, [shipments, year]);

const analyticsData =
  metric === 'orders'
    ? monthlyDistributorOrders
    : monthlyConsumerRevenue;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Distributor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage batches, transactions and analytics
          </p>
        </div>

        <Tabs defaultValue="batches">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="batches">
              <Package className="mr-2 h-4 w-4" />
              Incoming Batches
            </TabsTrigger>
            <TabsTrigger value="shipments">
              <Truck className="mr-2 h-4 w-4" />
              Shipment Details
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Receipt className="mr-2 h-4 w-4" />
              Transactions History
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics Page
            </TabsTrigger>
          </TabsList>

          {/* ================= Batches ================= */}
          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Batches</CardTitle>
                <CardDescription>Accept or reject farmer batches</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBatches ? (
                  <p>Loading batches...</p>
                ) : batches.length === 0 ? (
                  <p>No batches available</p>
                ) : (
                  <div className="space-y-4">
                    {batches.map((b) => (
                      <div key={b.batchId} className="rounded border p-4">
                        <h3 className="font-semibold">{b.cropType}</h3>
                        <p className="text-sm text-muted-foreground">
                          Farmer: {b.farmerName || 'Unknown'}
                        </p>
                        <p className="text-sm">Quantity: {b.quantity} kg</p>
                        <p className="text-sm">Status: {b.status}</p>

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => handleAccept(b.batchId)}>
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(b.batchId)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= Shipments ================= */}
          <TabsContent value="shipments">
  <Card>
    <CardHeader>
      <CardTitle>Shipments</CardTitle>
      <CardDescription>
        Consumers who accepted your batches
      </CardDescription>
    </CardHeader>

    <CardContent>
      {loadingShipments ? (
        <p>Loading shipments...</p>
      ) : shipments.length === 0 ? (
        <p className="text-muted-foreground">
          No shipments yet
        </p>
      ) : (
        <div className="space-y-4">
          {shipments.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {s.batch.cropType || 'Batch'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Batch ID: {s.batch.batchId.slice(0, 8)}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Accepted
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p>
                    <strong>Consumer:</strong> {s.consumer.email}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {s.batch.quantity} kg
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Status:</strong> {s.batch.status}
                  </p>
                  <p>
                    <strong>Accepted on:</strong>{' '}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>


          {/* ================= Transactions ================= */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Distributor payment history</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <p>No transactions found</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Batch</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-b">
                          <td className="p-2">{t.batchId}</td>
                          <td className="p-2">₹{t.amount}</td>
                          <td className="p-2">{t.status}</td>
                          <td className="p-2">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= Analytics ================= */}
          <TabsContent value="analytics">
            <Card className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100 border-none shadow-xl">
              <CardHeader>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      Yearly insights based on your transactions
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="border rounded px-3 py-1 text-sm"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    >
                      {availableYears.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>

                    <Button size="sm" variant="outline" onClick={exportChart}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total Orders', value: totalOrders },
                    { label: 'Total Revenue', value: `₹${totalRevenue}` },
                    { label: 'Avg Order Value', value: `₹${avgOrder}` },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-xl bg-white/70 backdrop-blur border p-4 shadow-md"
                    >
                      <p className="text-sm text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* TOGGLE */}
                <div className="flex justify-center gap-2 mb-4">
                  {['orders', 'revenue'].map((m) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={metric === m ? 'default' : 'outline'}
                      onClick={() => setMetric(m as any)}
                    >
                      {m === 'orders' ? 'Orders' : 'Revenue'}
                    </Button>
                  ))}
                </div>

                {/* CHART */}
                <div
                  ref={chartRef}
                  className="h-[520px] rounded-2xl bg-white p-6 shadow-lg"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a5b4fc" />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: 'none',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#barGradient)"
                        radius={[12, 12, 0, 0]}
                        animationDuration={900}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= PLACEHOLDERS ================= */}
          <TabsContent value="batches">
            <p className="text-muted-foreground hidden">Batches tab unchanged.</p>
          </TabsContent>

          <TabsContent value="shipments">
            <p className="text-muted-foreground hidden">Shipments coming soon.</p>
          </TabsContent>

          <TabsContent value="transactions">
            <p className="text-muted-foreground hidden">
              Transactions list unchanged.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DistributorDashboard;
