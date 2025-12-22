import { ToastContainer } from "react-toastify";
import { Home, LiveTv } from "@mui/icons-material";
import { PATH_ROUTES } from "$shared/routing";
import { UserPayload } from "$shared/models/auth";
import { ReactNode } from "react";
import { Topbar } from "#modules/ui-kit/menus/Topbar";
import { UserProvider } from "#modules/core/auth/UserProvider";
import { getUser } from "#modules/core/auth/server";
import { UserAvatarButton } from "#modules/core/auth/Avatar";
import { SidebarClient } from "#modules/ui-kit/menus/SidebarClient";
import { classes } from "#modules/utils/styles";
import { MenuItemData } from "#modules/ui-kit/menus/Sidebar";
import { SeriesIcon } from "#modules/series/SeriesIcon";
import { MoviesIcon } from "#modules/movies/MoviesIcon";
import { MusicsIcon } from "#modules/musics/MusicsIcon";
import { ModalProvider } from "#modules/ui-kit/modal/ModalContext";
import { ContextMenuProvider } from "#modules/ui-kit/ContextMenu";
import { MediaPlayerPageLayout } from "#modules/player/browser/MediaPlayer/MediaPlayerPageLayout";
import styles from "./layout.module.css";
import { LoginButton } from "./LoginButton";
import { NavigationWatcher } from "./NavigationWatcher";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

const sideData: (user: UserPayload | null)=> MenuItemData[] = (_user)=>[
  {
    icon: <Home />,
    label: "Inicio",
    path: "/",
    matchPath: {
      startsWith: "-",
    },
  },
  {
    icon: <MusicsIcon />,
    label: "Música",
    path: PATH_ROUTES.musics.frontend.path,
    matchPath: {
      startsWith: PATH_ROUTES.musics.frontend.path,
    },
  },
  {
    icon: <SeriesIcon />,
    label: "Series",
    path: "/series/history",
    matchPath: {
      startsWith: "/series",
    },
  },
  {
    icon: <MoviesIcon />,
    label: "Películas",
    path: "/movies",
  },
  {
    icon: <LiveTv />,
    label: "Player",
    path: "/player/remote",
    matchPath: {
      startsWith: "/player",
    },
  },
];

export default async function RootLayout( { children }: {
  children: React.ReactNode;
} ) {
  const user = await getUser();
  const topbarData: MenuItemData[] = [
    ...sideData(user).map(e=>( {
      ...e,
      title: e.label?.toString(),
      label: undefined,
    } )),
  ];
  const menu = <Topbar
    className={classes(styles.topbar, styles.fixed)}
    leftAside={
      <>
        <a className={classes(styles.topbarLeftAsideChild, styles.normal)} href="/">M<span className={styles.logoCenter}>Center</span></a>
        <a className={classes(styles.topbarLeftAsideChild, styles.mini)} href="/">M</a>
      </>
    }
    rightAside={
      <>
        {user && <UserAvatarButton user={user}/>}
        {!user && <LoginButton />}
      </>
    }
    mainData={topbarData}
  />;
  const sideBar = <SidebarClient
    className={classes(styles.fixed, styles.sidebar)}
    data={sideData(user)}/>;

  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        <NavigationWatcher />
        <GlobalProviders user={user}>
          <MediaPlayerPageLayout>
            {menu}
            {sideBar}
            <main className={styles.content}>
              {children}
            </main>
          </MediaPlayerPageLayout>
        </GlobalProviders>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}

type GlobalProvidersProps = {
  children: ReactNode;
  user: UserPayload | null;
};
function GlobalProviders( { children, user }: GlobalProvidersProps) {
  return <UserProvider initialUser={user}>
    <ModalProvider>
      <ContextMenuProvider>
        {children}
      </ContextMenuProvider>
    </ModalProvider>
  </UserProvider>;
}
