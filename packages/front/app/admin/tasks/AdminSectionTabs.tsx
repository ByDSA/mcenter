"use client";

import { PATH_ROUTES } from "$shared/routing";
import { TabsContainer } from "#modules/ui-kit/layouts/TabsContainer/TabsContainer";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";
import { useI18nContext } from "#modules/core/i18n/i18n-react";

export function AdminSectionTabs( { children }: { children: React.ReactNode } ) {
  const { LL } = useI18nContext();
  const data = [
    {
      path: PATH_ROUTES.tasks.frontend.doTasks.path,
      label: LL.admin.tasks.tabs.doTasks(),
      matchPath: {
        customMatch: (p) => {
          return p === PATH_ROUTES.tasks.frontend.doTasks.path;
        },
      },
    },
    {
      path: PATH_ROUTES.tasks.frontend.taskManager.path,
      label: LL.admin.tasks.tabs.taskManager(),
    },
  ] satisfies MenuItemData[];

  return <TabsContainer data={data}>{children}</TabsContainer>;
}
