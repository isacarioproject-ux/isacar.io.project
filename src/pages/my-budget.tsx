import { DashboardLayout } from '@/components/dashboard-layout';
import { BudgetManagerPage } from '@/components/finance/budget-manager-page';

export default function MyBudgetPage() {
  return (
    <DashboardLayout>
      <BudgetManagerPage />
    </DashboardLayout>
  );
}
