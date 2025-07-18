import Dashboard from '@/components/dashboard';
import { SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarInset>
      <Dashboard />
    </SidebarInset>
  );
}
