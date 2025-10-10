export enum ToRemotePlayerEvent {
  // Browser -> Backend
  CONNECTION = "connection",
  DISCONNECT = "disconnect",

  // Browser -> RemotePlayer
  PAUSE_TOGGLE = "pause-toggle",
  NEXT = "next",
  PREVIOUS = "previous",
  STOP = "stop",
  SEEK = "seek",
  PLAY = "play",
  PLAY_RESOURCE = "play-resource",
  FULLSCREEN_TOGGLE = "fullscreen-toggle",

  // Para filtrar tipos
  MAIN_TYPE = "to-remote-player",
};

export enum FromRemotePlayerEvent {
  // RemotePlayer -> Browser
  STATUS = "status",
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  OPEN_CLOSED = "open-closed",

  // Para filtrar tipos
  MAIN_TYPE = "from-remote-player",
}
