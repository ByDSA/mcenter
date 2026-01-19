import { logger } from "#modules/core/logger";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { copyText } from "./playlists/utils";

type Props = {
  txt: string | (()=> Promise<string> | string);
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CopyLinkContextMenuItem = (props: Props)=> {
  const copyLink = async () => {
    const txt = typeof props.txt === "string" ? props.txt : await props.txt();

    await copyText(txt);
    logger.info("Texto copiado.");
  };

  return <ContextMenuItem
    label="Copiar enlace"
    onClick={copyLink}
  />;
};
