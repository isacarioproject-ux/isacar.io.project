import { DashboardLayout } from '@/components/dashboard-layout';
import { EmpresaPageView } from '@/components/empresa/empresa-page-view';

export default function MyCompanyPage() {
  return (
    <DashboardLayout>
      <EmpresaPageView />
    </DashboardLayout>
  );
}
