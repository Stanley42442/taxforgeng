import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/lib/supabaseClient";

import { toast } from "sonner";
import logger from "@/lib/logger";
import { 
  Palette, 
  Code, 
  Copy, 
  Eye, 
  Save,
  Loader2,
  Image,
  Type,
  Layout,
  Settings
} from "lucide-react";
import { EmbeddableCalculator, PartnerTheme } from "@/components/EmbeddableCalculator";

interface PartnerData {
  id: string;
  name: string;
  api_key: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  border_radius: string;
  font_family: string;
  show_powered_by: boolean;
  embed_allowed_domains: string[] | null;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
  'Source Sans Pro',
  'Outfit',
  'Plus Jakarta Sans',
  'DM Sans'
];

const PartnerBranding = () => {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  
  // Theme state
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#1f2937');
  const [borderRadius, setBorderRadius] = useState('12');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [allowedDomains, setAllowedDomains] = useState('');

  const isCorporate = tier === 'corporate' || tier === 'business';

  useEffect(() => {
    if (user && isCorporate) {
      fetchPartners();
    } else {
      setLoading(false);
    }
  }, [user, isCorporate]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion since the database has additional columns now
      const typedData = (data || []) as PartnerData[];
      setPartners(typedData);
      
      if (typedData.length > 0) {
        selectPartner(typedData[0]);
      }
    } catch (error) {
      logger.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPartner = (partner: PartnerData) => {
    setSelectedPartner(partner);
    setBrandName(partner.brand_name || '');
    setLogoUrl(partner.logo_url || '');
    setPrimaryColor(partner.primary_color || '#10b981');
    setSecondaryColor(partner.secondary_color || '#3b82f6');
    setAccentColor(partner.accent_color || '#f59e0b');
    setBackgroundColor(partner.background_color || '#ffffff');
    setTextColor(partner.text_color || '#1f2937');
    setBorderRadius(partner.border_radius || '12');
    setFontFamily(partner.font_family || 'Inter');
    setShowPoweredBy(partner.show_powered_by ?? true);
    setAllowedDomains(partner.embed_allowed_domains?.join(', ') || '');
  };

  const saveTheme = async () => {
    if (!selectedPartner) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({
          brand_name: brandName || null,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          background_color: backgroundColor,
          text_color: textColor,
          border_radius: borderRadius,
          font_family: fontFamily,
          show_powered_by: showPoweredBy,
          embed_allowed_domains: allowedDomains ? allowedDomains.split(',').map(d => d.trim()) : null
        })
        .eq('id', selectedPartner.id);

      if (error) throw error;

      toast.success('Theme saved successfully!');
      fetchPartners();
    } catch (error) {
      logger.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const currentTheme: PartnerTheme = {
    brandName,
    logoUrl: logoUrl || undefined,
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    borderRadius,
    fontFamily,
    showPoweredBy
  };

  const embedCode = selectedPartner ? `<!-- TaxForge Embedded Calculator -->
<div id="taxforge-calculator"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  TaxForge.init({
    container: '#taxforge-calculator',
    apiKey: '${selectedPartner.api_key}'
  });
</script>` : '';

  const iframeCode = selectedPartner ? `<iframe 
  src="${window.location.origin}/embed/calculator?key=${selectedPartner.api_key}"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: ${borderRadius}px; max-width: 500px;"
></iframe>` : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <PageLayout title="White-Label Branding" icon={Palette} maxWidth="7xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!isCorporate) {
    return (
      <PageLayout title="White-Label Branding" icon={Palette} maxWidth="7xl">
        <div className="text-center py-12">
          <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">White-Label Access Required</h2>
          <p className="text-muted-foreground mb-6">Upgrade to Business or Corporate plan to access white-label branding.</p>
          <Button variant="hero" onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (partners.length === 0) {
    return (
      <PageLayout title="White-Label Branding" icon={Palette} maxWidth="7xl">
        <div className="text-center py-12">
          <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No API Keys Found</h2>
          <p className="text-muted-foreground mb-6">Create an API key first to customize your embedded calculator.</p>
          <Button variant="hero" onClick={() => window.location.href = '/api-docs'}>
            Create API Key
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="White-Label Branding" description="Customize your embedded tax calculator with your brand" icon={Palette} maxWidth="7xl">
          {/* Partner Selector */}
          {partners.length > 1 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Label className="mb-2 block">Select API Key</Label>
                <select
                  value={selectedPartner?.id || ''}
                  onChange={(e) => {
                    const partner = partners.find(p => p.id === e.target.value);
                    if (partner) selectPartner(partner);
                  }}
                  className="w-full p-2 rounded-md border border-border bg-background"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Settings Panel */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="branding">
                    <Image className="h-4 w-4 mr-2" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="colors">
                    <Palette className="h-4 w-4 mr-2" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="embed">
                    <Code className="h-4 w-4 mr-2" />
                    Embed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="branding" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Type className="h-5 w-5" />
                        Brand Identity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Brand Name</Label>
                        <Input
                          placeholder="Your Company Name"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Logo URL</Label>
                        <Input
                          placeholder="https://yoursite.com/logo.png"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 200x50px, transparent PNG
                        </p>
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full p-2 rounded-md border border-border bg-background"
                        >
                          {FONT_OPTIONS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Border Radius (px)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="32"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show "Powered by TaxForge"</Label>
                          <p className="text-xs text-muted-foreground">
                            Display attribution link
                          </p>
                        </div>
                        <Switch
                          checked={showPoweredBy}
                          onCheckedChange={setShowPoweredBy}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="h-5 w-5" />
                        Color Scheme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Secondary Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Accent Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Text Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-12 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="embed" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Code className="h-5 w-5" />
                        Embed Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>iFrame Embed (Recommended)</Label>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(iframeCode, 'iFrame code')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground">
                          {iframeCode}
                        </pre>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>JavaScript Embed</Label>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(embedCode, 'JS code')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="p-4 rounded-lg bg-secondary/80 overflow-x-auto text-xs font-mono text-foreground">
                          {embedCode}
                        </pre>
                      </div>
                      <div>
                        <Label>Allowed Domains (comma-separated)</Label>
                        <Input
                          placeholder="yoursite.com, app.yoursite.com"
                          value={allowedDomains}
                          onChange={(e) => setAllowedDomains(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to allow all domains
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button variant="hero" className="w-full" onClick={saveTheme} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Theme
              </Button>
            </div>

            {/* Preview Panel */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 bg-muted/30 rounded-b-lg">
                    <EmbeddableCalculator theme={currentTheme} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </PageLayout>
  );
};

export default PartnerBranding;
