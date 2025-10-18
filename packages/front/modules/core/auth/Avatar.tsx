"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useContextMenu, contextMenuStyles } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import styles from "./Avatar.module.css";
import { UserPayload } from "./models";
import { isAdmin } from "./utils";

type Props = {
  user: UserPayload;
};
export function UserAvatarButton( { user }: Props) {
  const { renderContextMenu, openMenu, isOpen } = useContextMenu( {
    className: styles.contextMenu,
    renderChildren: () => (<>
      <a className={contextMenuStyles.menuItem} href={PATH_ROUTES.auth.frontend.userPage.path}>
        Mi perfil
      </a>
      <p className={contextMenuStyles.menuItem}>Ajustes</p>
      {isAdmin(user) && <a className={contextMenuStyles.menuItem} href={"/admin"}>Admin</a>}
      <div className={contextMenuStyles.divider} />
      <a className={contextMenuStyles.menuItem} href={PATH_ROUTES.auth.frontend.logout.path}>
        Cerrar sesión
      </a>
    </>
    ),
  } );
  const handleClick = (event) => {
    openMenu( {
      event,
    } );
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={classes(styles.userAvatarButton, isOpen && styles.open)}
        aria-label="Menú de usuario"
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
      {renderContextMenu(null)}
    </>
  );
}
