import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Leaf,
  ScanLine,
  Shield,
  Sprout,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-600 text-primary-foreground">
        <div className="container mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl relative z-10">
            <span className="inline-block mb-4 rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
              🌱 Blockchain-powered agriculture
            </span>

            <h1 className="mb-6 text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Transparent Supply Chain <br />
              <span className="text-emerald-200">for Modern Agriculture</span>
            </h1>

            <p className="mb-10 text-xl text-primary-foreground/90 leading-relaxed">
              TraceBloom connects farmers, distributors, and consumers through
              blockchain-verified traceability — ensuring trust, authenticity,
              and sustainability from farm to fork.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary" className="shadow-xl">
                <Link to="/signup">Get Started Free</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-32 -right-32 opacity-20">
          <Sprout className="h-[32rem] w-[32rem]" />
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary">100%</h3>
              <p className="mt-2 text-muted-foreground">
                End-to-End Traceability
              </p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary">24/7</h3>
              <p className="mt-2 text-muted-foreground">
                Real-time Supply Chain Visibility
              </p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary">Zero</h3>
              <p className="mt-2 text-muted-foreground">
                Data Tampering (Blockchain Secured)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="mb-14 text-center text-4xl font-bold">
            How <span className="text-primary">TraceBloom</span> Works
          </h2>

          <div className="grid gap-10 md:grid-cols-3">

            <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-4">
                <Sprout className="h-9 w-9 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">
                For Farmers
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Register crop batches, generate QR codes, track payments,
                and build trust with immutable blockchain records.
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-4">
                <TrendingUp className="h-9 w-9 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">
                For Distributors
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage incoming batches, approve shipments, automate payments,
                and analyze performance with real-time dashboards.
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-4">
                <Shield className="h-9 w-9 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold">
                For Consumers
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Scan QR codes to verify authenticity, explore full product
                journeys, and confidently support ethical producers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <h2 className="mb-14 text-center text-4xl font-bold">
            Why Choose <span className="text-primary">TraceBloom</span>?
          </h2>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="flex gap-4">
              <ScanLine className="h-10 w-10 text-primary" />
              <div>
                <h4 className="text-xl font-semibold mb-1">
                  QR-Based Transparency
                </h4>
                <p className="text-muted-foreground">
                  Instant product verification with a single scan.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Globe className="h-10 w-10 text-primary" />
              <div>
                <h4 className="text-xl font-semibold mb-1">
                  Blockchain Integrity
                </h4>
                <p className="text-muted-foreground">
                  Tamper-proof records ensure trust across the chain.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Leaf className="h-10 w-10 text-primary" />
              <div>
                <h4 className="text-xl font-semibold mb-1">
                  Sustainable Impact
                </h4>
                <p className="text-muted-foreground">
                  Promote ethical sourcing and responsible farming.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <Users className="mx-auto mb-6 h-16 w-16 opacity-90" />

          <h2 className="mb-4 text-4xl font-bold">
            Join the TraceBloom Community
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/90">
            Whether you're a farmer, distributor, or consumer —
            TraceBloom empowers you with transparency, trust, and control
            over your food supply.
          </p>

          <Button asChild size="lg" variant="secondary" className="shadow-xl">
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
