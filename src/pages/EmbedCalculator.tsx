import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddableCalculator, PartnerTheme } from "@/components/EmbeddableCalculator";
import { Loader2 } from "lucide-react";

const EmbedCalculator = () => {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState<PartnerTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = searchParams.get('key');

  useEffect(() => {
    const fetchPartnerTheme = async () => {
      if (!apiKey) {
        setError('Missing API key');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('partners')
          .select('brand_name, logo_url, primary_color, secondary_color, accent_color, background_color, text_color, border_radius, font_family, show_powered_by, is_active')
          .eq('api_key', apiKey)
          .single();

        if (fetchError || !data) {
          setError('Invalid API key');
          setLoading(false);
          return;
        }

        if (!data.is_active) {
          setError('API key is inactive');
          setLoading(false);
          return;
        }

        setTheme({
          brandName: data.brand_name || undefined,
          logoUrl: data.logo_url || undefined,
          primaryColor: data.primary_color || '#10b981',
          secondaryColor: data.secondary_color || '#3b82f6',
          accentColor: data.accent_color || '#f59e0b',
          backgroundColor: data.background_color || '#ffffff',
          textColor: data.text_color || '#1f2937',
          borderRadius: data.border_radius || '12',
          fontFamily: data.font_family || 'Inter',
          showPoweredBy: data.show_powered_by ?? true
        });
      } catch (err) {
        console.error('Error fetching partner theme:', err);
        setError('Failed to load calculator');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerTheme();
  }, [apiKey]);

  // Embed-specific styles
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';

    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-center p-6">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your API key and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <EmbeddableCalculator 
        theme={theme || undefined} 
        onCalculate={(result) => {
          // Post message to parent window
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'taxforge-calculation',
              data: result
            }, '*');
          }
        }}
      />
    </div>
  );
};

export default EmbedCalculator;
