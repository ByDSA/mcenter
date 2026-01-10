import { showError } from "$shared/utils/errors/showError";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useMusic } from "#musics/hooks";
import { getMediumCoverUrlFromMusic } from "#musics/musics/MusicEntry/MusicEntry";
import { useBrowserPlayer } from "../BrowserPlayerContext";

export function useMediaSession(
  engine: HTMLAudioElement | null,
) {
  const player = useBrowserPlayer(useShallow((s) => ( {
    currentResource: s.currentResource,
    status: s.status,
    next: s.next,
    prev: s.prev,
    stop: s.stop,
    resume: s.resume,
    pause: s.pause,
    hasPrev: s.hasPrev,
    hasNext: s.hasNext,
  } )));
  const { data: music } = useMusic(player.currentResource?.resourceId ?? null);

  useEffect(() => {
    if (!navigator.mediaSession || !music || !engine)
      return;

    const coverUrl = getMediumCoverUrlFromMusic(music);

    navigator.mediaSession.metadata = new MediaMetadata( {
      title: music.title,
      artist: music.artist,
      album: music.album,
      artwork: coverUrl
        ? [{
          src: coverUrl,
          sizes: "512x512",
          type: "image/jpeg",
        }]
        : undefined,
    } );

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => player.resume()],
      ["pause", () => player.pause()],
      ["stop", () => player.stop()],
      ["previoustrack", () => player.hasPrev() && player.prev()],
      ["nexttrack", () => player.hasNext() && player.next()],
      ["seekbackward", () => engine.currentTime = Math.max(engine.currentTime - 10, 0)],
      [
        "seekforward",
        () => engine.currentTime = Math.min(engine.currentTime + 10, engine.duration),
      ],
      ["seekto", (d) => {
        if (d.seekTime)
          engine.currentTime = d.seekTime;
      }],
    ];

    actionHandlers.forEach(([act, h]) => {
      try {
        navigator.mediaSession.setActionHandler(act, h);
      } catch (e) {
        showError(e);
      }
    } );
  }, [music, engine, player]);

  useEffect(() => {
    if (!navigator.mediaSession)
      return;

    navigator.mediaSession.playbackState = player.status === "playing" ? "playing" : "paused";
  }, [player.status]);

  useEffect(() => {
    if (!navigator.mediaSession || !engine || !("setPositionState" in navigator.mediaSession))
      return;

    const updatePosition = () => {
      if (isFinite(engine.duration)) {
        try {
          navigator.mediaSession.setPositionState( {
            duration: engine.duration,
            playbackRate: engine.playbackRate,
            position: engine.currentTime,
          } );
        } catch { /* empty */ }
      }
    };

    engine.addEventListener("play", updatePosition);
    engine.addEventListener("pause", updatePosition);
    engine.addEventListener("seeked", updatePosition);
    engine.addEventListener("ratechange", updatePosition);
    engine.addEventListener("durationchange", updatePosition);

    return () => {
      engine.removeEventListener("play", updatePosition);
      engine.removeEventListener("pause", updatePosition);
      engine.removeEventListener("seeked", updatePosition);
      engine.removeEventListener("ratechange", updatePosition);
      engine.removeEventListener("durationchange", updatePosition);
    };
  }, [engine]);
}
