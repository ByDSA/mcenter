"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useContextMenuTrigger, contextMenuStyles, AnchorContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "./Avatar.module.css";
import { UserPayload } from "./models";
import { isAdmin } from "./utils";

type Props = {
  user: UserPayload;
};
export function UserAvatarButton( { user }: Props) {
  const { openMenu } = useContextMenuTrigger();
  const { LL } = useI18nContext();
  const content = (<>
    <AnchorContextMenuItem
      label={LL.core.user.profile.menuLabel()}
      href={PATH_ROUTES.auth.frontend.userPage.path}
    />
    <AnchorContextMenuItem
      label={LL.core.user.settings.menuLabel()}
      href={""}
      disabled
    />
    {isAdmin(user) && <AnchorContextMenuItem
      label={LL.admin.menuLabel()}
      href={PATH_ROUTES.tasks.frontend.doTasks.path}
    />}
    <div className={contextMenuStyles.divider} />
    <DaAnchor theme="text" href={PATH_ROUTES.auth.frontend.logout.path}>
      {LL.core.auth.logout.tab()}
    </DaAnchor>
  </>
  );
  const handleClick = (event) => {
    openMenu( {
      className: styles.contextMenu,
      event,
      content,
    } );
  };
  const isOpen = false; // TODO

  return (
    <>
      <button
        onClick={handleClick}
        className={classes(styles.userAvatarButton, isOpen && styles.open)}
        aria-label={LL.core.user.menuAriaLabel()}
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </>
  );
}
