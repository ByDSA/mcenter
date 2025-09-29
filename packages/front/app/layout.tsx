import { ToastContainer } from "react-toastify";
import { makeMenu } from "#modules/menus";
import { InitApis } from "#modules/core/initApis";
import { UserProvider } from "#modules/core/auth/UserProvider";
import { getUser } from "#modules/core/auth/server";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

export default async function RootLayout( { children }: {
  children: React.ReactNode;
} ) {
  const user = await getUser();
  const menu = makeMenu( {
    "/": "Inicio",
    "/admin": "Admin",
    "/series/history": "Series",
    "/music/history": "Música",
    ...(user
      ? {
        "/auth/user": "Usuario",
        "/auth/logout": "Logout",
      }
      : {
        "/auth/login": "Login",
      } ),
  } );

  return (
    <html lang="es">
      <head>
        <title>MCenter</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <InitApis />
        {menu}
        <UserProvider initialUser={user}>
          {children}
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
