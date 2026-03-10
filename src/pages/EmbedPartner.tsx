import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Download, ExternalLink, Code2, Monitor, ChevronRight, ArrowDown, Globe, Shield, Zap, Users, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmbeddableCalculator } from "@/components/EmbeddableCalculator";
import { SEOHead, createHowToSchema, createCalculatorSchema } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";

const JS_SDK_SNIPPET = `<!-- Step 1: Add the container div where you want the calculator -->
<div id="taxforge-calculator"></div>

<!-- Step 2: Load the TaxForge SDK (place before </body>) -->
<script src="https://taxforgeng.com/embed.js"></script>

<!-- Step 3: Initialize with your partner API key -->
<script>
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: 'YOUR_API_KEY_HERE'
  });
</script>`;

const IFRAME_SNIPPET = `<!-- TaxForge NG Tax Calculator (iframe embed) -->
<!-- Replace YOUR_API_KEY_HERE with your partner key  -->
<iframe
  src="https://taxforgeng.com/embed/calculator?key=YOUR_API_KEY_HERE"
  width="100%"
  height="820"
  style="border:none; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08);"
  title="Nigeria Tax Calculator by TaxForge NG"
  loading="lazy"
  allowtransparency="true">
</iframe>`;

const TROUBLESHOOTING = [
  {
    problem: 'Widget shows "Invalid API key"',
    cause: "Wrong key or key has been deleted/deactivated",
    fix: "Check your key in the partner dashboard or contact admin to reactivate",
  },
  {
    problem: 'Widget shows "Domain not authorized"',
    cause: "Your domain is not in the API key's allow-list",
    fix: "Contact admin to add your domain to the allowlist",
  },
  {
    problem: "Widget appears blank / shows white",
    cause: "Incorrect container selector or script loaded before DOM",
    fix: 'Ensure the <div id="taxforge-calculator"> exists before the script runs',
  },
  {
    problem: "Widget layout is broken on mobile",
    cause: "Parent container too narrow",
    fix: "Ensure parent has min-width: 320px and no overflow: hidden",
  },
];

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} className="shrink-0 gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

function downloadIntegrationGuide() {
  const doc = new jsPDF();
  const green = [16, 185, 129] as [number, number, number];
  const dark = [17, 24, 39] as [number, number, number];
  const grey = [107, 114, 128] as [number, number, number];

  let y = 20;
  const lm = 20;
  const pw = 170;

  // Header
  doc.setFillColor(...green);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TaxForge NG — Partner Integration Guide", lm, 26);
  y = 56;

  const section = (title: string) => {
    doc.setFillColor(240, 253, 244);
    doc.rect(lm - 2, y - 5, pw + 4, 10, "F");
    doc.setTextColor(...green);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, lm, y);
    y += 10;
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const line = (text: string, indent = 0) => {
    const lines = doc.splitTextToSize(text, pw - indent);
    doc.text(lines, lm + indent, y);
    y += lines.length * 6;
  };

  section("1. Prerequisites");
  line("No server-side setup required. You only need:");
  line("• A website with HTML (WordPress, Webflow, React, Vue, etc.)", 4);
  line("• A TaxForge NG partner API key (request one at taxforgeng.com/embed-partner)", 4);
  y += 4;

  section("2. JS SDK Embed (Recommended)");
  line("Add the following HTML to any page on your site:");
  y += 2;
  doc.setFillColor(249, 250, 251);
  doc.rect(lm, y, pw, 36, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('<div id="taxforge-calculator"></div>', lm + 3, y + 8);
  doc.text('<script src="https://taxforgeng.com/embed.js"></script>', lm + 3, y + 16);
  doc.text("TaxForge.init({", lm + 3, y + 24);
  doc.text("  container: '#taxforge-calculator', apiKey: 'YOUR_KEY'", lm + 3, y + 30);
  doc.text("});", lm + 3, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  y += 44;

  section("3. iFrame Embed (Alternative)");
  line("Use an <iframe> if your platform restricts custom scripts:");
  y += 2;
  doc.setFillColor(249, 250, 251);
  doc.rect(lm, y, pw, 20, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('<iframe src="https://taxforgeng.com/embed/calculator?key=YOUR_KEY"', lm + 3, y + 8);
  doc.text('  width="100%" height="820" style="border:none;"></iframe>', lm + 3, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  y += 28;

  section("4. Customisation Options");
  line("Pass extra options to TaxForge.init() to customise branding:");
  line("• primaryColor — HEX colour for buttons and highlights (e.g. '#0066cc')", 4);
  line("• brandName — Your company name shown in the widget header", 4);
  line("• logoUrl — URL to your logo image (PNG or SVG, max 40px height)", 4);
  line("• fontFamily — CSS font-family string (e.g. 'Georgia, serif')", 4);
  y += 4;

  section("5. Troubleshooting");
  TROUBLESHOOTING.forEach((t) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    line(`• ${t.problem}`);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grey);
    line(`  Cause: ${t.cause}`, 4);
    line(`  Fix: ${t.fix}`, 4);
    doc.setTextColor(...dark);
    y += 2;
  });

  section("6. Backlink Attribution");
  line("By using TaxForge NG's embed widget you agree to maintain a dofollow");
  line("backlink to taxforgeng.com on the page hosting the calculator. The");
  line('"Powered by TaxForge NG" link in the widget footer fulfils this requirement.');
  y += 4;

  section("7. Support");
  line("Email: hello@taxforgeng.com");
  line("Website: https://taxforgeng.com/embed-partner");
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...grey);
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB")} · TaxForge NG — Educational tool operated by Gillespie Benjamin Mclee (OptiSolve Labs)`, lm, 287);

  doc.save("TaxForge-NG-Partner-Integration-Guide.pdf");
}

export default function EmbedPartner() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    organization: "",
    websiteUrl: "",
    monthlyPageviews: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const seoSchema = {
    "@context": "https://schema.org",
    "@graph": [
      createCalculatorSchema(
        "TaxForge NG Partner Embed Widget",
        "Embed Nigeria's most accurate 2026 tax calculator on your site. Free for media, fintechs and accountancy firms.",
        "TaxCalculator"
      ),
      createHowToSchema(
        "How to Embed the TaxForge NG Tax Calculator",
        "Step-by-step guide to embed a Nigeria tax calculator widget on any website.",
        [
          { name: "Request an API key", text: "Fill in the partnership request form at taxforgeng.com/embed-partner to receive your API key." },
          { name: "Add the container div", text: 'Place <div id="taxforge-calculator"></div> where you want the widget to appear.' },
          { name: "Load the SDK", text: 'Add <script src="https://taxforgeng.com/embed.js"></script> before your closing </body> tag.' },
          { name: "Initialize the widget", text: "Call TaxForge.init({ container: '#taxforge-calculator', apiKey: 'YOUR_KEY' }) in a script tag." },
          { name: "Go live", text: "The widget is immediately live and calculates PIT, CIT and VAT using 2026 Nigeria Tax Act rules." },
        ]
      ),
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.organization || !formState.websiteUrl) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      new URL(formState.websiteUrl);
    } catch {
      toast.error("Please enter a valid website URL (including https://)");
      return;
    }

    setSubmitting(true);
    try {
      // Save to database (including email for decision notifications)
      const { error: dbError } = await supabase.from("partnership_requests").insert({
        name: formState.name,
        organization: formState.organization,
        website_url: formState.websiteUrl,
        monthly_pageviews: formState.monthlyPageviews || null,
        message: formState.message || null,
        email: formState.email,
      });
      if (dbError) throw dbError;

      // Send admin notification email (best-effort)
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        await fetch(`https://${projectId}.supabase.co/functions/v1/send-partnership-inquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formState.name,
            organization: formState.organization,
            websiteUrl: formState.websiteUrl,
            monthlyPageviews: formState.monthlyPageviews,
            message: formState.message,
          }),
        });
      } catch {
        // Non-fatal — DB record is already saved
      }

      setSubmitted(true);
      toast.success("Request submitted! We'll review and email you within 24 hours.");
    } catch (err: any) {
      toast.error("Failed to submit request. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout maxWidth="6xl" showBackground={true}>
      <SEOHead
        title="Embed Nigeria Tax Calculator on Your Site | TaxForge NG Partner Program"
        description="Free embeddable Nigeria tax calculator widget for media, fintechs and accountancy firms. Live demo, ready-to-paste code snippets, and full integration guide."
        canonicalPath="/embed-partner"
        keywords="embed Nigeria tax calculator, tax widget, PAYE calculator widget, Nigeria tax API, partner program, backlink exchange"
        schema={seoSchema}
      />

      {/* ─── Hero ─── */}
      <section className="mb-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Zap className="h-3 w-3" /> Free for Partners
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Embed Nigeria's Most Accurate<br className="hidden md:block" /> Tax Calculator on Your Site
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Free for media outlets, fintech platforms &amp; accountancy firms. We provide the tool — you add value to your readers and earn the backlink credit.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href="#demo">
                <Monitor className="h-4 w-4" /> Try the Live Demo
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="#request">
                <ChevronRight className="h-4 w-4" /> Request API Key
              </a>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Calculations / month", value: "10,000+" },
              { label: "Tax rules updated", value: "2026 NTA" },
              { label: "Mobile friendly", value: "100%" },
              { label: "Setup time", value: "< 5 min" },
            ].map((s) => (
              <div key={s.label} className="glass-frosted rounded-xl p-4 hover-lift">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Demo ─── */}
      <section id="demo" className="py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 gap-1.5 text-success border-success/40 bg-success/10">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Sandbox — results are real, no API key required
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Live Demo</h2>
            <p className="text-muted-foreground mt-2">This is exactly what your visitors will see when you embed the widget.</p>
          </div>
          <EmbeddableCalculator sandboxMode />
        </div>
      </section>

      {/* ─── Embed Snippets ─── */}
      <section id="snippets" className="py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Embed Code</h2>
            <p className="text-muted-foreground mt-2">Copy and paste one of the snippets below into your site.</p>
          </div>

          <Tabs defaultValue="sdk">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="sdk" className="gap-2"><Code2 className="h-3.5 w-3.5" /> JS SDK</TabsTrigger>
              <TabsTrigger value="iframe" className="gap-2"><Monitor className="h-3.5 w-3.5" /> iFrame</TabsTrigger>
            </TabsList>

            <TabsContent value="sdk">
              <Card className="glass-frosted">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">JavaScript SDK — recommended</CardTitle>
                  <CopyButton text={JS_SDK_SNIPPET} label="Copy Snippet" />
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto leading-relaxed text-foreground whitespace-pre-wrap">
                    {JS_SDK_SNIPPET}
                  </pre>
                  <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
                    Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY_HERE</code> with your partner key.{" "}
                    <a href="#request" className="text-primary hover:underline">Request one below →</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="iframe">
              <Card className="glass-frosted">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">iFrame — for CMS platforms (WordPress, Webflow, etc.)</CardTitle>
                  <CopyButton text={IFRAME_SNIPPET} label="Copy Snippet" />
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto leading-relaxed text-foreground whitespace-pre-wrap">
                    {IFRAME_SNIPPET}
                  </pre>
                  <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-warning" />
                    Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY_HERE</code> with your partner key.{" "}
                    <a href="#request" className="text-primary hover:underline">Request one below →</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ─── Integration Guide ─── */}
      <section id="guide" className="py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Integration Guide</h2>
              <p className="text-muted-foreground mt-1">Step-by-step setup, customisation &amp; troubleshooting.</p>
            </div>
            <Button variant="outline" className="gap-2 shrink-0" onClick={downloadIntegrationGuide}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {[
              {
                step: "1",
                title: "Request an API Key",
                body: "Fill in the partnership request form below. We'll review your site and send your API key within 24 hours. Your domain will be added to the allowlist at the same time.",
              },
              {
                step: "2",
                title: "Add the Snippet to Your HTML",
                body: "Paste the JS SDK or iFrame snippet (above) into any page. For WordPress, use a Custom HTML block; for Webflow, use an Embed element; for React/Vue, drop the div and script in your JSX/template.",
              },
              {
                step: "3",
                title: "Optional: Customise Branding",
                body: "Pass extra options to TaxForge.init(): primaryColor (HEX), brandName (string), logoUrl (image URL) and fontFamily. This lets you white-label the widget to match your site's design.",
              },
              {
                step: "4",
                title: "Maintain the Attribution Link",
                body: 'The widget includes a small "Powered by TaxForge NG" link in the footer. This fulfils the backlink agreement and must remain visible. Do not hide or remove it via CSS.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-4 glass-frosted rounded-xl hover-lift">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Troubleshooting */}
          <Card className="glass-frosted">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" /> Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {TROUBLESHOOTING.map((t, i) => (
                  <AccordionItem key={i} value={`t${i}`}>
                    <AccordionTrigger className="text-sm text-left">{t.problem}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium text-muted-foreground">Cause: </span>{t.cause}</p>
                        <p><span className="font-medium text-primary">Fix: </span>{t.fix}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Why Partner ─── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Partner with TaxForge NG?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "2026 Nigeria Tax Act Compliant",
                body: "Always up-to-date with the latest NRS rules — PIT, CIT, VAT, WHT, Small Company Exemption and Rent Relief included.",
              },
              {
                icon: Globe,
                title: "Free for Your Readers",
                body: "No signup required, no paywalls. Your visitors get instant, accurate tax results at no cost to them or you.",
              },
              {
                icon: Users,
                title: "Backlink Attribution",
                body: "Every embedded widget carries a 'Powered by TaxForge NG' dofollow link — giving you legitimate SEO backlink credit.",
              },
              {
                icon: Zap,
                title: "5-Minute Setup",
                body: "One snippet, no server-side code, no database. Works on WordPress, Webflow, React, plain HTML — anywhere.",
              },
              {
                icon: BookOpen,
                title: "Full Integration Guide",
                body: "Detailed docs, troubleshooting table, and PDF download. We handle support — you just embed and forget.",
              },
              {
                icon: Monitor,
                title: "Mobile-Responsive",
                body: "The widget adapts to any screen size. Perfectly readable on desktop, tablet and mobile.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="glass-frosted hover-lift">
                  <CardContent className="pt-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Partnership Request Form ─── */}
      <section id="request" className="py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Request an API Key</h2>
            <p className="text-muted-foreground mt-2">
              Tell us about your site and we'll set up a partner key within 24 hours.
            </p>
          </div>

          {submitted ? (
            <Card className="glass-frosted text-center py-10 shadow-futuristic">
              <CardContent>
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  We'll review your site and get back to you at the email you provided within 24 hours with your API key and setup instructions.
                </p>
                <Button asChild variant="outline">
                  <Link to="/">Back to TaxForge NG</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-frosted shadow-futuristic">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pr-name">Your Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="pr-name"
                        placeholder="Adaeze Okonkwo"
                        value={formState.name}
                        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pr-org">Organization <span className="text-destructive">*</span></Label>
                      <Input
                        id="pr-org"
                        placeholder="Acme Financial Blog"
                        value={formState.organization}
                        onChange={(e) => setFormState((s) => ({ ...s, organization: e.target.value }))}
                        maxLength={150}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pr-email">Email Address <span className="text-destructive">*</span></Label>
                    <Input
                      id="pr-email"
                      type="email"
                      placeholder="you@yoursite.com"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      maxLength={300}
                      required
                    />
                    <p className="text-xs text-muted-foreground">We'll send your approval decision and API key to this address.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pr-url">Website URL <span className="text-destructive">*</span></Label>
                    <Input
                      id="pr-url"
                      type="url"
                      placeholder="https://yoursite.com"
                      value={formState.websiteUrl}
                      onChange={(e) => setFormState((s) => ({ ...s, websiteUrl: e.target.value }))}
                      maxLength={300}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pr-pv">Monthly Pageviews (approx.)</Label>
                    <Select
                      value={formState.monthlyPageviews}
                      onValueChange={(v) => setFormState((s) => ({ ...s, monthlyPageviews: v }))}
                    >
                      <SelectTrigger id="pr-pv">
                        <SelectValue placeholder="Select range..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-1k">Under 1,000</SelectItem>
                        <SelectItem value="1k-10k">1,000 – 10,000</SelectItem>
                        <SelectItem value="10k-50k">10,000 – 50,000</SelectItem>
                        <SelectItem value="50k-200k">50,000 – 200,000</SelectItem>
                        <SelectItem value="200k+">200,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pr-msg">Message (optional)</Label>
                    <Textarea
                      id="pr-msg"
                      placeholder="Tell us about your site and how you plan to use the widget..."
                      value={formState.message}
                      onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                      maxLength={1000}
                      rows={4}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    By submitting this form you agree to maintain a visible "Powered by TaxForge NG" attribution link on any page that embeds the widget.
                  </p>

                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Partnership Request"}
                    {!submitting && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ─── Footer CTA ─── */}
      <section className="py-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground text-sm mb-4">
            Already have an account? Access advanced tools, payroll, invoicing and AI tax advice.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/auth"><ExternalLink className="h-3.5 w-3.5" /> Sign In</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/pricing"><Zap className="h-3.5 w-3.5" /> See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
