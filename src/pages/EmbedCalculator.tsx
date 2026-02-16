import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmbeddableCalculator, PartnerTheme } from "@/components/EmbeddableCalculator";
import { Loader2 } from "lucide-react";
import logger from "@/lib/logger";

const EmbedCalculator = () => {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState<PartnerTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = searchParams.get('key');

  useEffect(() => {
    const validateKey = async () => {
      if (!apiKey) {
        setError('Missing API key');
        setLoading(false);
        return;
      }

      // Validate key format before sending to server
      if (apiKey.length > 50 || apiKey.length < 20 || !apiKey.startsWith('txf_')) {
        setError('Invalid API key format');
        setLoading(false);
        return;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/validate-embed-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });

        if (response.status === 429) {
          setError('Rate limit exceeded. Please try again later.');
          setLoading(false);
          return;
        }

        if (response.status === 403) {
          setError('This domain is not authorized to use this calculator.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || 'Invalid API key');
          setLoading(false);
          return;
        }

        const { theme: themeData } = await response.json();
        setTheme(themeData);
      } catch (err) {
        logger.error('Error validating embed key:', err);
        setError('Failed to load calculator');
      } finally {
        setLoading(false);
      }
    };

    validateKey();
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

  // Determine postMessage target origin from referrer
  const getTargetOrigin = (): string | null => {
    try {
      if (document.referrer) {
        return new URL(document.referrer).origin;
      }
    } catch {
      // Invalid referrer URL
    }
    return null;
  };

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
          const targetOrigin = getTargetOrigin();
          if (window.parent !== window && targetOrigin) {
            window.parent.postMessage({
              type: 'taxforge-calculation',
              data: result
            }, targetOrigin);
          }
        }}
      />
    </div>
  );
};

export default EmbedCalculator;
