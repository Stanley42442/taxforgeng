import { NavMenu } from "@/components/NavMenu";
import { PayrollCalculator } from "@/components/PayrollCalculator";

const Payroll = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payroll Calculator</h1>
          <p className="text-muted-foreground">Calculate PAYE, pension, and net salary for employees</p>
        </div>
        <PayrollCalculator />
      </div>
    </div>
  );
};

export default Payroll;