/* eslint-disable @typescript-eslint/naming-convention */
type AppUrlLinkProps = {
  appUrl: string;
  appName: string;
};
export const createAppUrlLink = ( { appUrl,
  appName }: AppUrlLinkProps) => ()=>(
  <a className="app-name"
    href={appUrl}
    target="_blank"
    rel="noopener noreferrer">
    {appName}
  </a>
);

type CenterProps = {
  children: React.ReactNode;
};
export const Center = ( { children }: CenterProps) => (
  <div className="center-wrap">
    {children}
  </div>
);

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
};
export const ButtonLink = ( { href,
  children }: ButtonLinkProps) => (
  <a href={href} className="btn" target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const Url = ( { href }: { href: string } ) => (
  <p className="url-fallback">
    <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>
  </p>
);
