import { ToastContainer } from "react-toastify";
import { Home, SettingsRemote } from "@mui/icons-material";
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
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { MoviesIcon } from "#modules/movies/MoviesIcon";
import { MusicsIcon } from "#modules/musics/MusicsIcon";
import { ModalProvider } from "#modules/ui-kit/modal/ModalContext";
import { ContextMenuProvider } from "#modules/ui-kit/ContextMenu";
import { MediaPlayerPageLayout } from "#modules/player/browser/MediaPlayer/MediaPlayerPageLayout";
import { TopbarMainClient } from "#modules/ui-kit/menus/TopbarClient";
import { GlobalQueryClientProvider } from "#modules/fetching/QueryClientProvider";
import { Favicon } from "#modules/utils/Favicon/Favicon";
import styles from "./layout.module.css";
import { LoginButton } from "./LoginButton";
import { NavigationWatcher } from "./NavigationWatcher";
import { getMusicMainUrl } from "./musics/utils";
import { ManifestManager } from "./manifest/ManifestManager";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

const sideData: (user: UserPayload | null)=> MenuItemData[] = (user)=>[
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
    path: getMusicMainUrl(user),
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
    icon: <SettingsRemote />,
    label: "Remoto",
    path: "/player/remote",
    matchPath: {
      startsWith: "/player",
    },
  },
];

export default async function RootLayout( { children, customMain }: {
  children: ReactNode;
  customMain: ReactNode;
} ) {
  const user = await getUser();

  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <ManifestManager />
      </head>
      <body>
        <NavigationWatcher />
        <GlobalProviders user={user}>
          <MediaPlayerPageLayout>
            {await Menu(customMain)}
            {await SideBar()}
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
    <GlobalQueryClientProvider>
      <ModalProvider>
        <ContextMenuProvider>
          {children}
        </ContextMenuProvider>
      </ModalProvider>
    </GlobalQueryClientProvider>
  </UserProvider>;
}

async function Menu(customMainSlot: React.ReactNode) {
  const user = await getUser();
  const topbarData: MenuItemData[] = [
    ...sideData(user).map(e=>( {
      ...e,
      title: e.label?.toString(),
      label: undefined,
    } )),
  ];
  const main = <>
    <span className={styles.menu}>
      <TopbarMainClient data={topbarData} />
    </span>
    {customMainSlot}
  </>;
  const menu = <Topbar
    className={classes(styles.topbar, styles.fixed)}
    leftAside={
      <>
        <a className={classes(styles.topbarLeftAsideChild, styles.normal)} href="/"><Favicon/><span className={styles.logoCenter}>Center</span></a>
        <a className={classes(styles.topbarLeftAsideChild, styles.mini)} href="/"><Favicon/></a>
      </>
    }
    rightAside={
      <>
        {user && <UserAvatarButton user={user}/>}
        {!user && <LoginButton />}
      </>
    }
    main={main}
  />;

  return menu;
}

async function SideBar() {
  const user = await getUser();
  const sideBar = <SidebarClient
    className={classes(styles.fixed, styles.sidebar)}
    data={sideData(user)}/>;

  return sideBar;
}
