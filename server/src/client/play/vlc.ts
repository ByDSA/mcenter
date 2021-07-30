import VLC, { VLCFlag } from "./vlc/VLC";

export async function closeVLC() {
  await VLC.closeAll();
}

export const vlcConfig = [
  VLCFlag.PLAY_AND_EXIT,
  VLCFlag.NO_VIDEO_TITLE,
  VLCFlag.ASPECT_RATIO, "16:9",
  VLCFlag.FULLSCREEN,
  VLCFlag.MINIMAL_VIEW,
  VLCFlag.NO_REPEAT,
  VLCFlag.NO_LOOP,
  VLCFlag.ONE_INSTANCE];

export async function openVLC(file: string): Promise<VLC> {
  const vlc = new VLC();

  vlc.config(...vlcConfig);
  await vlc.open(file);

  return vlc;
}
