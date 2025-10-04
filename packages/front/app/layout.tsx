import { ToastContainer } from "react-toastify";
import { Home, LiveTv, Movie, MusicNote } from "@mui/icons-material";
import { Topbar } from "#modules/ui-kit/menus/Topbar";
import { InitApis } from "#modules/core/initApis";
import { UserProvider } from "#modules/core/auth/UserProvider";
import { getUser } from "#modules/core/auth/server";
import { UserAvatarButton } from "#modules/core/auth/Avatar";
import { SidebarClient } from "#modules/ui-kit/menus/SidebarClient";
import { classes } from "#modules/utils/styles";
import styles from "./layout.module.css";
import { LoginButton } from "./LoginButton";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

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
    mainData={[
      {
        label: <Home />,
        title: "Inicio",
        path: "/",
      },
      {
        label: <Movie />,
        title: "Series",
        path: "/series",
      },
      {
        label: <MusicNote />,
        title: "Música",
        path: "/music",
      },
      {
        label: <LiveTv />,
        title: "Player",
        path: "/player",
      },
    ]}
  />;
  const sideBar = <SidebarClient
    className={classes(styles.fixed, styles.sidebar)}
    data={[
      {
        icon: <Home />,
        label: "Inicio",
        path: "/",
      },
      {
        icon: <MusicNote />,
        label: "Música",
        path: "/music",
      },
      {
        icon: <Movie />,
        label: "Series",
        path: "/series",
      },
      {
        icon: <Movie />,
        label: "Películas",
        path: "/movies",
      },
      {
        icon: <LiveTv />,
        label: "Player",
        path: "/player",
      },
    ]}/>;

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
        <InitApis />
        <UserProvider initialUser={user}>
          {menu}
          {sideBar}
          <main className={styles.content}>
            {children}
          </main>
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
