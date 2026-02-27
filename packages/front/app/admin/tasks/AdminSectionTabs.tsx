"use client";

import { PATH_ROUTES } from "$shared/routing";
import { TabsContainer } from "#modules/ui-kit/layouts/TabsContainer/TabsContainer";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";

export function AdminSectionTabs( { children }: { children: React.ReactNode } ) {
  const data = [
    {
      path: PATH_ROUTES.tasks.frontend.doTasks.path,
      label: "Do tasks",
      matchPath: {
        customMatch: (p) => {
          return p === PATH_ROUTES.tasks.frontend.doTasks.path;
        },
      },
    },
    {
      path: PATH_ROUTES.tasks.frontend.taskManager.path,
      label: "Task Manager",
    },
  ] satisfies MenuItemData[];

  return <TabsContainer data={data}>{children}</TabsContainer>;
}
