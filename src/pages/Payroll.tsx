import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { PayrollCalculator } from "@/components/PayrollCalculator";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown } from "lucide-react";

const Payroll = () => {
  const { tier } = useSubscription();
  const navigate = useNavigate();
  
  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const canAccess = tierOrder.indexOf(tier) >= tierOrder.indexOf('professional');

  if (!canAccess) {
    return (
      <PageLayout title="Payroll Calculator" description="Calculate PAYE, pension, and net salary" icon={Users}>
        <Card className="max-w-2xl mx-auto text-center p-8">
          <Crown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payroll Calculator</h2>
          <p className="text-muted-foreground mb-6">
            Calculate PAYE, pension, and net salary for employees. Available on Professional plan and above.
          </p>
          <Button onClick={() => navigate('/pricing')}>Upgrade to Access</Button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Payroll Calculator" description="Calculate PAYE, pension, and net salary for employees" icon={Users}>
      <PayrollCalculator />
    </PageLayout>
  );
};

export default Payroll;