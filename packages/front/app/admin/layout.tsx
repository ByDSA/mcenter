import { PageContainer } from "app/PageContainer";
import AdminLayout from "#modules/core/auth/Admin.layout";
import { TabsContainer } from "app/TabsContainer";

import "./page.css";

export default function AdminSectionLayout( { children }: {
  children: React.ReactNode;
} ) {
  const data = [
    {
      path: "/admin/",
      label: "Do tasks",
    },
    {
      path: "/admin/task-manager",
      label: "Task Manager",
    },
  ];

  return AdminLayout( {
    children: <>
      <TabsContainer data={data}>
        <PageContainer>
          <h1>Admin</h1>
          {children}
        </PageContainer>
      </TabsContainer>
    </>,
  } );
}
