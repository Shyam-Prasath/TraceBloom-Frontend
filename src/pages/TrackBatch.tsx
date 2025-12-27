import { Navbar } from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// ---------------------------
// ✅ Define batch structure
// ---------------------------
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
}

// ---------------------------
// ✅ Default backend URL
// ---------------------------
const BACKEND_URL =
  import.meta.env.VITE_API_BASE || 'https://tracebloom-backend-2.onrender.com';

// ---------------------------
// ✅ Status order & labels
// ---------------------------
const STATUS_ORDER = ['harvested', 'in-transit', 'delivered', 'consumed'];

const STATUS_LABELS: Record<string, string> = {
  harvested: 'Harvested',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  consumed: 'Consumed',
};

// ---------------------------
// ✅ TrackBatch Component
// ---------------------------
const TrackBatch = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // ✅ Fetch crop batch details
  // ---------------------------
  useEffect(() => {
    if (!batchId) return;

    const fetchBatch = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/batches/${batchId}`);
        if (!res.ok) throw new Error('Failed to fetch batch details');
        const data: Batch = await res.json();
        setBatch(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  // ---------------------------
  // ✅ Loading state
  // ---------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 animate-pulse">
          Loading batch details...
        </p>
      </div>
    );
  }

  // ---------------------------
  // ✅ Error / not found state
  // ---------------------------
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg font-semibold">
          Batch not found or invalid ID.
        </p>
      </div>
    );
  }

  // ---------------------------
  // ✅ Calculate progress
  // ---------------------------
  const currentStatusIndex = STATUS_ORDER.indexOf(batch.status);
  const progressPercent = ((currentStatusIndex + 1) / STATUS_ORDER.length) * 100;

  // ---------------------------
  // ✅ UI Rendering
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-12 px-4">
        <Card className="shadow-lg border-none rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-700">
              Track Your Crop
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Tracking ID:{' '}
              <span className="font-mono text-sm">{batch.batchId}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-10">
            {/* --------------------------- */}
            {/* ✅ Crop Image Section */}
            {/* --------------------------- */}
            {batch.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={batch.imageUrl}
                  alt={batch.cropType}
                  className="w-full max-w-md h-64 object-cover rounded-xl shadow-md border"
                />
              </div>
            )}

            {/* --------------------------- */}
            {/* ✅ Crop Info Section */}
            {/* --------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Crop Type" value={batch.cropType} />
              {batch.description && (
                <Info label="Description" value={batch.description} />
              )}
              <Info label="Quantity" value={`${batch.quantity} kg`} />
              {batch.location && <Info label="Location" value={batch.location} />}
              <Info label="Harvest Date" value={batch.harvestDate || '-'} />
            </div>

            {/* --------------------------- */}
            {/* ✅ Progress Section */}
            {/* --------------------------- */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Tracking Progress
              </h3>

              {/* Progress bar */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-4 bg-green-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Status markers */}
              <div className="relative flex justify-between mt-4">
                {STATUS_ORDER.map((status, idx) => {
                  const isActive = idx <= currentStatusIndex;
                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center w-1/4"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-500 ${
                          isActive
                            ? 'bg-green-500 border-green-600'
                            : 'bg-gray-300 border-gray-300'
                        }`}
                      ></div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isActive ? 'text-green-700' : 'text-gray-400'
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --------------------------- */}
            {/* ✅ Current Status Card */}
            {/* --------------------------- */}
            <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold">Current Status</h3>
              <p className="text-gray-700 mt-1 text-base">
                {STATUS_LABELS[batch.status] || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---------------------------
// ✅ Reusable Info Component
// ---------------------------
const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
    <p className="text-gray-700">{value}</p>
  </div>
);

export default TrackBatch;
