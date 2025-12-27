import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { History, QrCode, Sprout, Wallet } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Batch {
  batchId: string;
  cropType: string;
  description?: string | null;
  quantity: number;
  location?: string | null;
  status: string;
  harvestDate?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  farmerName?: string | null;
  farmerPhone?: string | null;
}

interface Payment {
  batchId: string;
  amount: number;
  status: string;
  date: string;
  description?: string | null;
}

const BACKEND_URL = import.meta.env.VITE_API_BASE || 'https://tracebloom-backend-2.onrender.com';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [image, setImage] = useState<File | null>(null);

  // ==============================
  // 📦 Fetch Batches
  // ==============================
  const fetchBatches = async () => {
    if (!user?.walletAddress) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/batches?walletAddress=${user.walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch batches');
      const data: Batch[] = await res.json();
      setBatches(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch batches');
    }
  };

  // ==============================
  // 💰 Fetch Payments
  // ==============================
  const fetchPayments = async () => {
    if (!user?.walletAddress) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments?walletAddress=${user.walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data: Payment[] = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch payments');
    }
  };

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBatches();
      fetchPayments();
    }
  }, [user?.walletAddress]);

  // ==============================
  // 🌾 Register New Batch
  // ==============================
  const handleRegisterBatch = async () => {
    if (!cropType || !quantity || !harvestDate || !location || !farmerName || !farmerPhone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user?.walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('cropType', cropType);
    formData.append('quantity', quantity);
    formData.append('harvestDate', harvestDate);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('walletAddress', user.walletAddress);
    formData.append('farmerName', farmerName);
    formData.append('farmerPhone', farmerPhone);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`${BACKEND_URL}/api/batches`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Batch registered successfully!');
        setCropType('');
        setQuantity('');
        setHarvestDate('');
        setLocation('');
        setDescription('');
        setFarmerName('');
        setFarmerPhone('');
        setImage(null);
        fetchBatches();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || 'Failed to register batch');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 📱 Generate QR Code
  // ==============================
  const handleGenerateQR = () => {
    if (!selectedBatch) {
      toast.error('Please select a batch');
      return;
    }
    setShowQR(true);
  };

  // ==============================
  // 💰 Payment Calculations
  // ==============================
  const farmerPayments = payments.filter((p) => batches.some((b) => b.batchId === p.batchId));
  const totalEarnings = farmerPayments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = farmerPayments.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const monthlyEarnings = farmerPayments
    .filter((p) => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // ==============================
  // 🎨 UI
  // ==============================
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your crops, generate QR codes, and track your payments.
          </p>
        </div>

        <Tabs defaultValue="registration" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registration">
              <Sprout className="mr-2 h-4 w-4" /> Crop Registration
            </TabsTrigger>
            <TabsTrigger value="qrcode">
              <QrCode className="mr-2 h-4 w-4" /> QR Generation
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Wallet className="mr-2 h-4 w-4" /> Payment Tracker
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" /> Batch History
            </TabsTrigger>
          </TabsList>

          {/* 🌱 Crop Registration */}
          <TabsContent value="registration">
            <Card>
              <CardHeader>
                <CardTitle>Register New Crop Batch</CardTitle>
                <CardDescription>Add your latest crop harvest details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farmerName">Farmer Name</Label>
                    <Input id="farmerName" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} placeholder="e.g., Shyam Prasath" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmerPhone">Phone Number (with country code)</Label>
                    <Input id="farmerPhone" type="tel" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} placeholder="+91XXXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cropType">Crop Type</Label>
                    <Input id="cropType" value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="e.g., Organic Tomatoes" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Harvest Date</Label>
                    <Input id="harvestDate" type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Farm Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Region" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description of the crop batch" rows={3} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="image">Upload Crop Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <Button onClick={handleRegisterBatch} disabled={loading}>
                  {loading ? 'Registering...' : 'Register Crop Batch'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📱 QR Generation */}
          <TabsContent value="qrcode">
            <Card>
              <CardHeader>
                <CardTitle>Generate QR Codes</CardTitle>
                <CardDescription>Create scannable codes for your batches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Select Batch</Label>
                <select
                  value={selectedBatch}
                  onChange={(e) => { setSelectedBatch(e.target.value); setShowQR(false); }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a batch</option>
                  {batches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.batchId} - {b.cropType}
                    </option>
                  ))}
                </select>
                <Button onClick={handleGenerateQR}>Generate QR Code</Button>
                {showQR && (
                  <div className="mt-6 flex flex-col items-center">
                    <QRCodeCanvas value={`${window.location.origin}/track/${selectedBatch}`} size={180} />
                    <p className="mt-3 text-sm text-muted-foreground">Scan to view crop journey</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 💰 Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Tracker</CardTitle>
                <CardDescription>Monitor your earnings and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Earnings</CardDescription>
                      <CardTitle className="text-3xl text-primary">${totalEarnings}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Pending Payments</CardDescription>
                      <CardTitle className="text-3xl text-accent">${pendingPayments}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>This Month</CardDescription>
                      <CardTitle className="text-3xl">${monthlyEarnings}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="mt-6 rounded-lg border overflow-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-sm font-medium">Date</th>
                        <th className="p-3 text-left text-sm font-medium">Batch ID</th>
                        <th className="p-3 text-left text-sm font-medium">Description</th>
                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                        <th className="p-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerPayments.map((p, i) => {
                        const batch = batches.find((b) => b.batchId === p.batchId);
                        return (
                          <tr key={i} className="border-b">
                            <td className="p-3 text-sm">{p.date}</td>
                            <td className="p-3 text-sm">{p.batchId}</td>
                            <td className="p-3 text-sm">{batch?.description || '-'}</td>
                            <td className="p-3 text-sm">${p.amount}</td>
                            <td className="p-3 text-sm">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  p.status === 'Paid' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📜 Batch History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Batch History</CardTitle>
                <CardDescription>All registered crop batches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No batches found.</p>
                ) : (
                  batches.map((b) => (
                    <div key={b.batchId} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {b.batchId} - {b.cropType}
                          </h3>
                          {b.description && <p className="text-sm text-muted-foreground">{b.description}</p>}
                          <p className="text-sm text-muted-foreground">Harvested: {b.harvestDate}</p>
                          {b.farmerName && (
                            <p className="text-sm text-muted-foreground">
                              Farmer: {b.farmerName} ({b.farmerPhone})
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            b.status === 'delivered' || b.status === 'Delivered'
                              ? 'bg-primary/10 text-primary'
                              : b.status === 'in-transit' || b.status === 'In Transit'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      {b.imageUrl && <img src={b.imageUrl} alt="Crop" className="mt-2 h-48 w-full rounded-lg object-cover" />}
                      <p className="mt-2 text-sm text-muted-foreground">
                        Quantity: {b.quantity}kg {b.location ? `| Location: ${b.location}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
