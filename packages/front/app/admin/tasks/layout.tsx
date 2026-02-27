import { PageContainer } from "#modules/ui-kit/layouts/PageContainer/PageContainer";
import AdminLayout from "#modules/core/auth/Admin.layout";
import { AdminSectionTabs } from "./AdminSectionTabs";

import "./layout.css";

export default function AdminSectionLayout( { children }: {
  children: React.ReactNode;
} ) {
  return <AdminLayout>
    <AdminSectionTabs>
      <PageContainer>
        {children}
      </PageContainer>
    </AdminSectionTabs>
  </AdminLayout>;
}
