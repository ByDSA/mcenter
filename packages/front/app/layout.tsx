import { ToastContainer } from "react-toastify";
import { Home, LiveTv } from "@mui/icons-material";
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
import styles from "./layout.module.css";
import { LoginButton } from "./LoginButton";
import { NavigationWatcher } from "./NavigationWatcher";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

const sideData: ()=> MenuItemData[] = ()=>[
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
    path: "/music/history",
    matchPath: {
      startsWith: "/music",
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
const topbarData: MenuItemData[] = [
  ...sideData().map(e=>( {
    ...e,
    title: e.label?.toString(),
    label: undefined,
  } )),
];

export default async function RootLayout( { children }: {
  children: React.ReactNode;
} ) {
  const user = await getUser();
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
    data={sideData()}/>;

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
        <UserProvider initialUser={user}>
          <ModalProvider>
            <ContextMenuProvider>
              {menu}
              {sideBar}
              <main className={styles.content}>
                {children}
              </main>
            </ContextMenuProvider>
          </ModalProvider>
        </UserProvider>
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
