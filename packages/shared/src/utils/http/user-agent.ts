export function isMediaPlayerUserAgent(userAgent: string): boolean {
  const mediaPlayers = [
    /VLC/i,
    /iTunes/i,
    /foobar2000/i,
    /Winamp/i,
    /mpv/i,
    /MPlayer/i,
    /XBMC/i,
    /Kodi/i,
  ];

  return mediaPlayers.some(pattern => pattern.test(userAgent));
}
