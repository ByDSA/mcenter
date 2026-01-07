import { PATH_ROUTES } from "$shared/routing";
import { useEffect, useState } from "react";
import { useMusic } from "#musics/hooks";
import { backendUrl } from "#modules/requests";

const getUrl = async (musicId: string | null) => {
  if (!musicId)
    return null;

  const music = await useMusic.get(musicId);

  if (!music)
    return null;

  const base = backendUrl(PATH_ROUTES.musics.slug.withParams(music.slug));
  const u = new URL(base);

  u.searchParams.set("format", "raw");

  return u;
};

export const getUrlSkipHistory = async (musicId: string | null) => {
  const url = await getUrl(musicId);

  if (!url)
    return "";

  const u = new URL(url.href);

  u.searchParams.set("skip-history", "1");

  return u.href;
};

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined")
      setIsOnline(navigator.onLine);

    const setOn = () => setIsOnline(true);
    const setOff = () => setIsOnline(false);

    window.addEventListener("online", setOn);
    window.addEventListener("offline", setOff);

    return () => {
      window.removeEventListener("online", setOn);
      window.removeEventListener("offline", setOff);
    };
  }, []);

  return isOnline;
}
