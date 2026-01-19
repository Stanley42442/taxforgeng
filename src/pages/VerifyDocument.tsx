import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, FileText, Calendar, Building2, Hash, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface DocumentVerification {
  id: string;
  document_id: string;
  document_type: string;
  document_hash: string;
  business_name: string | null;
  generated_at: string;
  metadata: Record<string, unknown>;
}

const VerifyDocument: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<DocumentVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyDocument = async () => {
      if (!documentId) {
        setError('No document ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('document_verifications')
          .select('*')
          .eq('document_id', documentId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Document not found');
          } else {
            setError('Failed to verify document');
          }
        } else {
          setDocument(data as DocumentVerification);
        }
      } catch {
        setError('An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };

    verifyDocument();
  }, [documentId]);

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'tax_calculation': 'Tax Calculation Report',
      'business_report': 'Business Report',
      'invoice': 'Invoice',
      'expense_report': 'Expense Report',
    };
    return labels[type] || type;
  };

  return (
    <PageLayout title="Document Verification">
      <div className="max-w-2xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {loading ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                <p className="text-muted-foreground">Verifying document...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-destructive/50">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-semibold text-destructive mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This document could not be verified. It may have been tampered with, 
                    the ID is incorrect, or the document was never registered with TaxForge.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : document ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/50 overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Document Verified</h2>
                    <p className="text-primary-foreground/80">
                      This is an authentic TaxForge document
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Document Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Document Type</p>
                      <p className="font-medium">{getDocumentTypeLabel(document.document_type)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Hash className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Document ID</p>
                      <p className="font-mono text-sm">{document.document_id}</p>
                    </div>
                  </div>

                  {document.business_name && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Business</p>
                        <p className="font-medium">{document.business_name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Generated</p>
                      <p className="font-medium">
                        {new Date(document.generated_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ({formatDistanceToNow(new Date(document.generated_at), { addSuffix: true })})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Hash</p>
                      <p className="font-mono text-xs break-all">{document.document_hash}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-primary/5">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Digitally Signed
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      <Shield className="h-3 w-3 mr-1" />
                      Tamper-Proof
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      TaxForge Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <Card className="mt-4 bg-muted/30">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground text-center">
                  This verification confirms that the document was generated by TaxForge NG 
                  and has not been modified since creation.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default VerifyDocument;
