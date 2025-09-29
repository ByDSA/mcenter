/* eslint-disable @typescript-eslint/naming-convention */
import { createAppUrlLink } from "./utils";

export type BaseEmailProps = {
  children: React.ReactNode;
  title?: string;
  appName: string;
  appUrl: string;
  supportEmail: string;
};

export const BaseEmail = ( { children, title, appName, appUrl, supportEmail }: BaseEmailProps) => {
  const AppUrlLink = createAppUrlLink( {
    appName,
    appUrl,
  } );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </head>

      <body>
        <table className="wrapper" role="presentation"
          cellPadding="0" cellSpacing="0" border={0}>
          <tr>
            <td align="center">
              <table className="container" role="presentation"
                cellPadding="0" cellSpacing="0" border={0}>
                <tr>
                  <td className="header" align="center">
                    <div className="logo"><AppUrlLink /></div>
                    <div className="subtitle">{title}</div>
                  </td>
                </tr>
                <tr>
                  <td className="content">
                    {children}
                  </td>
                </tr>
                <tr>
                  <td className="footer" align="center">
                    <div><AppUrlLink /> · {new Date().getFullYear()}</div>
                    <div>
                      Dirección de soporte: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};
