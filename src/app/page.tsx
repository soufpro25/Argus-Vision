import Dashboard from '@/app/dashboard/page';
import { SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarInset>
      <Dashboard />
    </SidebarInset>
  );
}
