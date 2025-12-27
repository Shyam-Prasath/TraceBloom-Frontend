import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { FileText, ScanLine, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Html5QrcodeScanner } from "html5-qrcode";
import { useRef } from "react";


const BASE_URL = "https://tracebloom-backend-2.onrender.com";

const ConsumerDashboard = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [acceptedBatches, setAcceptedBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [consumer, setConsumer] = useState<any | null>(null);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  const [manualUrl, setManualUrl] = useState("");
const qrRegionRef = useRef<HTMLDivElement | null>(null);
const [scannerVisible, setScannerVisible] = useState(false);

const startQrScanner = () => {
  setScannerVisible(true);

  setTimeout(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        window.open(decodedText, "_blank");
      },
      (error) => {
        console.warn(error);
      }
    );
  }, 300);
};

const openManualUrl = () => {
  if (!manualUrl) {
    alert("Please enter a URL");
    return;
  }

  let url = manualUrl;
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  window.open(url, "_blank");
};

  const consumerId = consumer?.id;
  const consumerEmail = consumer?.email;

  /* =================== FETCH CONSUMER =================== */
  useEffect(() => {
    const email = localStorage.getItem('user-email');
    if (!email) return;

    axios
      .get(`${BASE_URL}/api/users/email/${email}`)
      .then((res) => setConsumer(res.data))
      .catch(console.error);
  }, []);

  /* =================== FETCH BATCHES =================== */
  useEffect(() => {
    if (!consumerId) return;

    // Fetch all batches
    axios
      .get(`${BASE_URL}/api/consumer/batches/${consumerId}`)
      .then((res) => setBatches(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);

    // Fetch accepted batches for review
    axios
      .get(`${BASE_URL}/api/consumer/accepted-batches/${consumerId}`)
      .then((res) => setAcceptedBatches(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);

    // Fetch payments
    axios
      .get(`${BASE_URL}/api/consumer/payments/${consumerId}`)
      .then((res) => setPayments(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, [consumerId]);

  /* =================== FETCH REVIEWS =================== */
  useEffect(() => {
    if (!selectedBatch) return;

    axios
      .get(`${BASE_URL}/api/consumer/reviews/${selectedBatch.batchId}`)
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, [selectedBatch]);

  /* =================== ACCEPT BATCH =================== */
  const handleAccept = async () => {
    if (!selectedBatch || !consumer) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/consumer/accept`, {
        batchId: selectedBatch.batchId,
        consumerId,
        consumerEmail,
      });

      setBatches((prev) =>
        prev.map((b) =>
          b.batchId === selectedBatch.batchId ? res.data.batch : b
        )
      );

      setAcceptedBatches((prev) => [...prev, res.data.batch]);
      setSelectedBatch(res.data.batch);
      alert('✅ Batch accepted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Accept failed');
    }
  };

  /* =================== REJECT BATCH =================== */
  const handleReject = async () => {
    if (!selectedBatch || !consumer) return;

    try {
      await axios.post(`${BASE_URL}/api/consumer/reject`, {
        batchId: selectedBatch.batchId,
        consumerId,
        consumerEmail,
      });

      setBatches((prev) => prev.filter((b) => b.batchId !== selectedBatch.batchId));
      setSelectedBatch(null);
      alert('❌ Batch rejected!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Reject failed');
    }
  };

  /* =================== SUBMIT REVIEW =================== */
  const handleSubmitReview = async () => {
    if (!selectedBatch || rating === 0) {
      alert('Select batch and rating');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/consumer/review`, {
        batchId: selectedBatch.batchId,
        consumerId,
        rating,
        title: reviewTitle,
        comment: reviewText,
      });

      setReviews((prev) => [res.data, ...prev]);
      setReviewTitle('');
      setReviewText('');
      setRating(0);
      alert('⭐ Review submitted!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Review failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 px-6 md:px-12 lg:px-20 py-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Consumer Dashboard
        </h1>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="scanner">
              <ScanLine className="mr-2 h-4 w-4" /> QR Scanner
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText className="mr-2 h-4 w-4" /> Products Details
            </TabsTrigger>
            <TabsTrigger value="payments">
              <ShieldCheck className="mr-2 h-4 w-4" /> Payments Deatails
            </TabsTrigger>
            <TabsTrigger value="review">
              <Star className="mr-2 h-4 w-4" /> Review
            </TabsTrigger>
          </TabsList>

          {/* ================= QR SCANNER ================= */}
<TabsContent value="scanner">
  <div className="max-w-3xl mx-auto px-6 py-12">
    <Card className="border-2 border-dashed border-green-300 shadow-xl">
      <CardHeader className="text-center space-y-4">
        <ScanLine className="h-24 w-24 mx-auto text-green-400" />
        <CardTitle className="text-3xl font-bold">
          Scan Product QR Code
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Scan a QR code on the product to view complete traceability details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* SCAN BUTTON */}
        {!scannerVisible && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-10 py-6 text-lg bg-green-400 hover:bg-green-300"
              onClick={startQrScanner}
            >
              <ScanLine className="mr-2 h-5 w-5" />
              Scan QR
            </Button>
          </div>
        )}

        {/* QR CAMERA */}
        {scannerVisible && (
          <div
            id="qr-reader"
            ref={qrRegionRef}
            className="mx-auto w-full max-w-sm rounded-lg overflow-hidden"
          />
        )}

        {/* OR DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* MANUAL URL */}
        <div className="space-y-4">
          <Label className="text-base">
            Enter traceability URL manually
          </Label>

          <div className="flex gap-3">
            <Input
              placeholder="https://tracebloom.io/batch/123"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />
            <Button
              onClick={openManualUrl}
              className="bg-green-600 hover:bg-green-700"
            >
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>


          {/* ================= PRODUCT DETAILS ================= */}
<TabsContent value="details" className="space-y-12">

  {/* ===== AVAILABLE PRODUCTS ===== */}
  <section>
    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <FileText className="h-6 w-6 text-green-600" />
      Available Products
    </h2>

    {batches.length === 0 ? (
      <p className="text-gray-500">No in-transit batches available</p>
    ) : (
      <div className="grid md:grid-cols-3 gap-8">
        {batches.map((batch) => {
          const isSelected = selectedBatch?.batchId === batch.batchId;

          return (
            <Card
              key={batch.batchId}
              onClick={() =>
                setSelectedBatch(isSelected ? null : batch)
              }
              className={`
                cursor-pointer transition-all duration-300
                hover:shadow-2xl hover:-translate-y-1
                ${isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200'}
              `}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {batch.name}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    {batch.status}
                  </span>
                </CardTitle>
                <CardDescription>
                  Batch #{batch.batchId.slice(0, 8)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Farmer: <span className="font-medium">{batch.farmerName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  📦 Quantity: <span className="font-medium">{batch.quantity}</span>
                </div>

                {/* EXPANDED ACTIONS */}
                {isSelected && (
                  <div className="mt-6 pt-4 border-t space-y-4 animate-in fade-in">
                    <p className="text-sm text-gray-600">
                      {batch.description || "No description provided"}
                    </p>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleAccept}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✅ Accept Product
                      </Button>
                      <Button
                        onClick={handleReject}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </section>

  {/* ===== ACCEPTED PRODUCTS ===== */}
  {acceptedBatches.length > 0 && (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="h-6 w-6 text-green-600" />
        Your Accepted Products
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {acceptedBatches.map((batch) => (
          <Card
            key={batch.batchId}
            className="border-green-400 bg-green-50 shadow-lg"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                {batch.name}
              </CardTitle>
              <CardDescription>
                Batch #{batch.batchId.slice(0, 8)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-gray-700">
              <p>👨‍🌾 Farmer: {batch.farmerName}</p>
              <p>📦 Quantity: {batch.quantity}</p>
              <p className="text-green-700 font-semibold">
                ✅ Accepted & Delivered
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )}
</TabsContent>


          {/* ================= PAYMENTS ================= */}
<TabsContent value="payments" className="space-y-8">

  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <ShieldCheck className="h-6 w-6 text-green-600" />
      Payment History
    </h2>
  </div>

  {payments.length === 0 ? (
    <div className="text-center py-16 text-gray-500">
      No payments recorded yet
    </div>
  ) : (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white">

      {/* TABLE HEADER */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-600">
        <div>Batch</div>
        <div>Distributor</div>
        <div>Status</div>
        <div>Amount</div>
        <div className="text-right">Action</div>
      </div>

      {/* TABLE ROWS */}
      <div className="divide-y">
        {payments.map((p) => {
          const statusColor =
            p.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : p.status === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";

          return (
            <div
              key={p.id}
              className="grid grid-cols-5 gap-4 px-6 py-5 items-center
                         hover:bg-gray-50 transition-colors"
            >
              {/* Batch */}
              <div className="font-medium text-gray-800">
                {p.batch?.name || "Unknown Batch"}
              </div>

              {/* Distributor */}
              <div className="text-gray-600 truncate">
                {p.distributor?.email || "N/A"}
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                >
                  {p.status}
                </span>
              </div>

              {/* Amount */}
              <div className="font-semibold text-gray-900">
                ${p.amount}
              </div>

              {/* Action */}
              <div className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</TabsContent>


          {/* ================= REVIEW ================= */}
<TabsContent value="review" className="space-y-10">

  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <Star className="h-6 w-6 text-yellow-500" />
      Product Reviews
    </h2>
  </div>

  {acceptedBatches.length === 0 ? (
    <div className="text-center py-16 text-gray-500">
      No accepted products available for review
    </div>
  ) : (
    <div className="grid lg:grid-cols-2 gap-12">

      {/* ================= LEFT: BATCH SELECTION ================= */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-700">
          Select a product
        </h3>

        <div className="space-y-4">
          {acceptedBatches.map((batch) => {
            const isActive = selectedBatch?.batchId === batch.batchId;

            return (
              <div
                key={batch.batchId}
                onClick={() => setSelectedBatch(batch)}
                className={`
                  p-5 rounded-xl border cursor-pointer transition-all
                  ${isActive
                    ? "border-green-600 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300 hover:shadow-sm"}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {batch.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Batch #{batch.batchId.slice(0, 8)}
                    </p>
                  </div>

                  {isActive && (
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
                      Selected
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  👨‍🌾 {batch.farmerName} · 📦 {batch.quantity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RIGHT: REVIEW FORM ================= */}
      <div className="bg-white border rounded-2xl shadow-xl p-8 space-y-6">

        {!selectedBatch ? (
          <div className="text-center py-20 text-gray-500">
            Select a product to write a review
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Review: {selectedBatch.name}
              </h3>
              <p className="text-sm text-gray-500">
                Share your experience with this product
              </p>
            </div>

            {/* STAR RATING */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Rating
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => setRating(s)}
                    className={`
                      h-8 w-8 cursor-pointer transition-transform
                      hover:scale-110
                      ${rating >= s
                        ? "text-yellow-400"
                        : "text-gray-300"}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* TITLE */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Review title
              </Label>
              <Input
                placeholder="Amazing quality, very fresh!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>

            {/* COMMENT */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Your feedback
              </Label>
              <Textarea
                rows={4}
                placeholder="Describe your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Submit Review
            </Button>
          </>
        )}
      </div>
    </div>
  )}

  {/* ================= PREVIOUS REVIEWS ================= */}
  {reviews.length > 0 && (
    <div className="pt-10 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        Previous Reviews
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.title}</span>
                <span className="text-sm text-yellow-500">
                  {Array(r.rating).fill('⭐').join('')}
                </span>
              </CardTitle>
              <CardDescription>
                by {r.consumer?.email || "Anonymous"}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-gray-700">
              {r.comment}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )}
</TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ConsumerDashboard;
