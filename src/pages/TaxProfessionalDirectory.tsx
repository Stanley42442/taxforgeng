import { useState, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TAX_PROFESSIONALS, SPECIALTIES, PROFESSIONAL_BODIES, type Specialty, type ProfessionalBody } from "@/lib/taxProfessionals";
import { NIGERIAN_STATES } from "@/lib/nigerianStates";
import { Search, MapPin, Phone, Globe, Mail, Shield, Building2, ExternalLink, AlertTriangle } from "lucide-react";

const TaxProfessionalDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedBody, setSelectedBody] = useState<string>("all");

  const filtered = useMemo(() => {
    return TAX_PROFESSIONALS.filter((pro) => {
      if (searchQuery && !pro.firmName.toLowerCase().includes(searchQuery.toLowerCase()) && !pro.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedState !== "all" && pro.state !== selectedState) return false;
      if (selectedSpecialty !== "all" && !pro.specialties.includes(selectedSpecialty as Specialty)) return false;
      if (selectedBody !== "all" && !pro.professionalBodies.includes(selectedBody as ProfessionalBody)) return false;
      return true;
    });
  }, [searchQuery, selectedState, selectedSpecialty, selectedBody]);

  const uniqueStates = useMemo(() => {
    const states = new Set(TAX_PROFESSIONALS.map((p) => p.state));
    return Array.from(states).sort();
  }, []);

  const specialtyColor = (s: Specialty) => {
    const map: Record<string, string> = {
      CIT: "bg-primary/10 text-primary",
      PIT: "bg-accent/80 text-accent-foreground",
      VAT: "bg-success/10 text-success",
      WHT: "bg-warning/10 text-warning",
      Payroll: "bg-secondary text-secondary-foreground",
      "Transfer Pricing": "bg-destructive/10 text-destructive",
      "Tax Audit": "bg-muted text-muted-foreground",
      "E-Filing": "bg-primary/10 text-primary",
      Advisory: "bg-accent/80 text-accent-foreground",
    };
    return map[s] || "bg-muted text-muted-foreground";
  };

  // LocalBusiness structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Nigerian Tax Professionals Directory",
    description: "Find qualified tax professionals across Nigeria",
    itemListElement: filtered.map((pro, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: pro.firmName,
        address: { "@type": "PostalAddress", addressLocality: pro.city, addressRegion: pro.state, addressCountry: "NG" },
        ...(pro.phone && { telephone: pro.phone }),
        ...(pro.website && { url: pro.website }),
        description: pro.description,
      },
    })),
  };

  return (
    <PageLayout>
      <SEOHead
        title="Find a Tax Professional | TaxForge NG"
        description="Search Nigeria's directory of qualified tax professionals. Filter by state, specialty, and professional body."
        canonicalPath="/tax-professionals"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find a Tax Professional</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search qualified tax consultants, accountants, and advisors across Nigeria. Filter by location, specialty, or professional body membership.
          </p>
        </div>

        {/* Disclaimer */}
        <Alert variant="default" className="mb-6 border-warning/30 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm text-muted-foreground">
            TaxForge NG does not endorse or guarantee any listed professional. Always verify credentials independently through CITN or ICAN before engaging services.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search firms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger><SelectValue placeholder="All Specialties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALTIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedBody} onValueChange={setSelectedBody}>
            <SelectTrigger><SelectValue placeholder="All Bodies" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Professional Bodies</SelectItem>
              {PROFESSIONAL_BODIES.map((b) => <SelectItem key={b.value} value={b.value}>{b.value}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filtered.length} of {TAX_PROFESSIONALS.length} professionals
        </p>

        {/* Results */}
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No professionals match your filters. Try broadening your search.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((pro) => (
              <Card key={pro.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{pro.firmName}</CardTitle>
                    <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{pro.city}, {pro.state}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{pro.description}</p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5">
                    {pro.specialties.map((s) => (
                      <Badge key={s} variant="outline" className={`text-xs ${specialtyColor(s)}`}>{s}</Badge>
                    ))}
                  </div>

                  {/* Professional Bodies */}
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex gap-1.5">
                      {pro.professionalBodies.map((b) => (
                        <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {pro.phone && (
                      <a href={`tel:${pro.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Phone className="h-3 w-3" /> {pro.phone}
                      </a>
                    )}
                    {pro.email && (
                      <a href={`mailto:${pro.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Mail className="h-3 w-3" /> Email
                      </a>
                    )}
                    {pro.website && (
                      <a href={pro.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Globe className="h-3 w-3" /> Website <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Verification Links */}
        <Card className="mt-8 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Verify Professional Credentials</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Always confirm membership status before engaging a tax professional. Use these official portals:
          </p>
          <div className="flex flex-wrap gap-3">
            {PROFESSIONAL_BODIES.map((b) => (
              <Button key={b.value} variant="outline" size="sm" asChild>
                <a href={b.verifyUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {b.value} Portal
                </a>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TaxProfessionalDirectory;
