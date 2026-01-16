import { PageLayout } from "@/components/PageLayout";
import { PayrollCalculator } from "@/components/PayrollCalculator";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Users } from "lucide-react";

const Payroll = () => {
  const { tier } = useSubscription();
  
  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const canAccess = tierOrder.indexOf(tier) >= tierOrder.indexOf('professional');

  if (!canAccess) {
    return (
      <PageLayout title="Payroll Calculator" description="Calculate PAYE, pension, and net salary" icon={Users}>
        <div className="max-w-2xl mx-auto">
          <UpgradePrompt 
            feature="Payroll Calculator" 
            requiredTier="professional"
            showFeatures={true}
          />
        </div>
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