"use client";

import { PATH_ROUTES } from "$shared/routing";
import { useContextMenuTrigger, contextMenuStyles } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import styles from "./Avatar.module.css";
import { UserPayload } from "./models";
import { isAdmin } from "./utils";

type Props = {
  user: UserPayload;
};
export function UserAvatarButton( { user }: Props) {
  const { openMenu } = useContextMenuTrigger();
  const content = (<>
    <DaAnchor
      theme="text"
      href={PATH_ROUTES.auth.frontend.userPage.path}>
        Mi perfil
    </DaAnchor>
    <DaAnchor
      theme="text">Ajustes</DaAnchor>
    {isAdmin(user) && <DaAnchor theme="text" href={"/admin"}>Admin</DaAnchor>}
    <div className={contextMenuStyles.divider} />
    <DaAnchor theme="text" href={PATH_ROUTES.auth.frontend.logout.path}>
        Cerrar sesión
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
    </>
  );
}
