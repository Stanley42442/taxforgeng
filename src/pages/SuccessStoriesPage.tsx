import { PageLayout } from "@/components/PageLayout";
import { SuccessStories } from "@/components/SuccessStories";
import { ReviewSubmissionForm } from "@/components/ReviewSubmissionForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Star, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SuccessStoriesPage = () => {
  const { user } = useAuth();

  return (
    <PageLayout title="Success Stories" description="Real results from real Nigerian businesses" icon={Star} maxWidth="6xl">
      {/* Testimonials */}
      <SuccessStories showTitle={false} autoPlay={false} />

      {/* Review Submission Section */}
      <div className="mt-16 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
          Share Your Story
        </h2>
        {user ? (
          <div className="max-w-2xl mx-auto">
            <ReviewSubmissionForm />
          </div>
        ) : (
          <div className="max-w-md mx-auto glass-frosted rounded-2xl p-8 text-center">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Login to Share Your Experience
            </h3>
            <p className="text-muted-foreground mb-6">
              Sign in to submit your success story and help other businesses discover TaxForge NG.
            </p>
            <Link to="/auth">
              <Button variant="glow" className="gap-2">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="mt-16">
        <div className="max-w-2xl mx-auto glass-frosted rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your free trial today and see why Nigerian businesses trust TaxForge NG.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/advisory">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Free<ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">View Pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SuccessStoriesPage;
