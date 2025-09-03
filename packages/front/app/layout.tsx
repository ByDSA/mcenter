import { ToastContainer } from "react-toastify";
import { makeMenu } from "#modules/menus";
import { InitApis } from "#modules/core/initApis";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

export default function RootLayout( { children }: {
  children: React.ReactNode;
} ) {
  const menu = makeMenu( {
    "/": "Inicio",
    "/admin": "Admin",
    "/series/history": "Series",
    "/music/history": "Música",
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

        {children}
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
