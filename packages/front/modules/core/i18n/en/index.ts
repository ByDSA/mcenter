import { Translation } from "../i18n-types";
import { AUTH_EN } from "../../auth/i18n";

const en = {
  uikit: {
    forms: {
      errors: {
        matchFields: "Fields must match.",
        requiredField: "Required field.",
        invalidEmail: "Invalid email format.",
      },
      optionalField: "optional",
      unsavedDataModalTitle: "Unsaved data.",
      unsavedData: "There is unsaved data.",
      labels: {
        name: "Name",
        email: "Email",
      },
    },
    modals: {
      confirmDelete: "Confirm deletion",
      confirmClose: "Are you sure you want to close?",
    },
    actions: {
      save: "Save",
      edit: "Edit",
      create: "Create",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Yes",
      close: "Close",
      change: "Change",
      new: "New",
    },
  },
  core: {
    auth: AUTH_EN,
    errors: {
      notFound: {
        title: "😨 Oops... 😨",
        message: "Element not found.",
      },
      forbidden: {
        title: "403 - Access Denied",
        message: "You don't have permission to access this page.",
      },
      unauthorized: {
        unauthorized: "Unauthorized",
      },
    },
    user: {
      settings: {
        menuLabel: "Settings",
      },
      menuAriaLabel: "User menu",
      profile: {
        menuLabel: "My profile",
        title: "Profile",
        publicName: "Public name",
        firstName: "First name",
        lastName: "Last name",
        roles: "Roles",
        music: "Music",
        favoritePlaylist: {
          favoritePlaylist: "Favorite playlist",
          none: "<None>",
        },
      },
    },
  },
  main: {
    welcome: "Welcome to MCenter",
    menu: {
      home: "Home",
      music: "Music",
      series: "Series",
      movies: "Movies",
      remote: "Remote",
    },
    pwa: {
      button: "Install shortcut",
      appNamePrompt: "What name do you want for your App?",
      title: "Install as App",
      text: "Open in browser to install",
      installingError: "Could not install",
      errorNoEvent: "Installation attempted without a captured event",
      installed: "App installed successfully",
      installApp: "Install App",
      appAddressWillBe: "The App address will be",
    },
  },

  // ─── App-wide reusables ────────────────────────────────────────────────────
  common: {
    upload: {
      unknownType: "Unknown type",
      pending: "Pending upload",
      uploaded: "Uploaded!",
    },
    lists: {
      empty: "There are no items in this list.",
    },
    dates: {
      today: "today",
      yesterday: "yesterday",
      date: "Date",
      duration: "Duration",
      playedAt: "Played at",
    },
  },

  // ─── Administration ────────────────────────────────────────────────────────
  admin: {
    menuLabel: "Admin",
    tasks: {
      tabs: {
        doTasks: "Run tasks",
        taskManager: "Task manager",
      },
      noTasksFound: "No tasks found.",
      errorLabel: "Error",
      imageCoversRebuildAll: "Image Covers: rebuild all",
      episodes: {
        updateLastTimePlayed: "Episodes: updateLastTimePlayed",
        fileInfoUpdateSaved: "Episodes: update file-info saved",
        updateFileInfosOffloaded: "Episodes: update file infos offloaded",
      },
      musics: {
        searchDuplicates: "Musics: search duplicates",
        updateFileInfos: "Musics: update file infos",
        updateFileInfosOffloaded: "Musics: update file infos offloaded",
      },
    },
  },

  modules: {
    player: {
      player: "{{count:player|players}}",
      remote: {
        title: "Players",
        noPlayers: "No remote player detected.",
        status: {
          offline: "Offline",
          closed: "Closed",
          open: "Open",
          unknown: "Unknown",
        },
        errorSse: "Error parsing SSE data",
      },
      controls: {
        prev: "Previous",
        next: "Next",
        rewind10: "Rewind 10 seconds",
        forward10: "Forward 10 seconds",
        stop: "Stop",
        repeat: "Repeat",
        shuffle: "Shuffle",
        close: "Close",
        fullPlayer: "Full player",
        play: "Play",
        pause: "Pause",
        resume: "Resume",
      },
      queue: {
        title: "Queue",
        empty: "No items in the queue",
        priority: {
          add: "Add to the queue",
          remove: "Remove from the queue",
        },
      },
      effects: {
        title: "Effects",
      },
      settings: {
        goToPlaylist: "Go to playlist",
        playModified: "Play modified",
      },
    },
    musics: {
      count: "{count} {{count:song|songs}}",
      lists: {
        tab: "Lists",
        playlists: {
          oneNotFound: "Playlist not found",
          oneCreated: "New playlist created",
          new: "New playlist",
          select: "Select playlist",
          none: "None",
          alreadyAdded: "\"{musicTitle}\" was already in \"{playlistName}\" and has not been \
added.",
          added: "\"{musicTitle}\" added to \"{playlistName}\"",
        },
        smartPlaylists: {
          oneCreated: "New Smart Playlist created",
          new: "New Smart Playlist",
          play: "Play Smart Playlist",
          playModified: "Play modified",
          invalidQuery: "Invalid query",
        },
      },
      search: {
        placeholder: "Search music...",
        oneNotFound: "Music not found",
      },
      upload: {
        fromYoutube: "From YouTube",
        fromLocal: "From local",
        sectionTitle: "Uploaded tracks",
        noneUploaded: "You haven't uploaded any music yet.",
        youtubeUrlPlaceholder: "Video or playlist URL",
        attempt: "(Attempt {current}/{max})",
        processing: "Processing task",
        tab: "Upload",
      },
      edit: {
        confirmDelete: "Are you sure you want to delete this track?",
        optionalProps: "Optional properties",
        loadError: "Error loading track",
        disabled: "Disabled",
        spotifyId: "Spotify ID",
        tagsHint: "Tags (use # for global tags)",
        editFiles: "Edit files",
      },
      info: {
        userTags: "User Tags",
      },
      autoplay: {
        clickTo: "Click to",
        playMusic: "Play music",
      },
      labels: {
        artist: "Artist",
        album: "Album",
        year: "Year",
        country: "Country",
        game: "Game",
      },
      bulkEdit: {
        activate: "Multi-select",
        editCount: "Edit {count} {{count:track|tracks}}",
        selectedCount: "{count} {{count:track|tracks}} selected",
        selectMusics: "Select tracks",
        exit: "Exit",
        editSelected: "Edit selected",
        saving: "Saving…",
        applyToCount: "Apply to {count} selected",
        currentValuesTitle: "Current values — {field}",
        selectItem: "Select track",
        tags: {
          add: "Add",
          replace: "Replace",
          remove: "Remove",
        },
      },
    },
    episodes: {
      count: "{count} episode{{s}}",
      edit: {
        confirmDelete: "Are you sure you want to permanently delete this episode?",
        loadError: "Error loading episode",
        episode: "Episode",
        hash: "Hash",
        size: "Size",
      },
      search: {
        oneNotFound: "Episode not found",
      },
      series: {
        lists: {
          tab: "Browse",
        },
        search: {
          oneNotFound: "Series not found",
        },
        seasons: {
          count: "{count} season{{s}}",
          noSeasons: "No seasons found.",
        },
        edit: {
          confirmDelete: "Are you sure you want to delete this series?",
        },
        episodes: {
          noEpisodes: "There are no episodes in this season.",
          lastSeen: "Last watched: {date}",
        },
        actions: {
          checkAvailability: "Check availability",
          uploadFromLocal: "From local",
        },
        labels: {
          newTitle: "New series",
          editTitle: "Edit series",
          name: "Name",
        },
      },
      labels: {
        key: "Key",
        start: "Start",
        end: "End",
      },
    },
    resources: {
      visibility: {
        public: "Public list",
        private: "Private list",
      },
      history: {
        history: "History",
        deleteEntry: "Delete entry?",
        removeFromHistory: "Remove from history",
        latestViews: "View latest plays",
        loadError: "Error loading history",
        neverPlayed: "No plays yet.",
      },
      share: {
        autoplay: "Autoplay",
        includeToken: "Include token",
      },
      labels: {
        title: "Title",
        tags: "Tags",
        image: "Image",
        weight: "Weight",
        path: "Path",
        query: "Query",
        createdAt: "Created",
        addedAt: "Added",
        updatedAt: "Updated",
        timestamps: "Timestamps",
        lastTimePlayed: "Last played",
        releasedOn: "Released",
        slug: "URL slug",
        visibility: "Visibility",
      },
    },
    imageCover: {
      label: "Label",
      current: "Current",
      replaceImage: "Replace Image",
      deleteConfirm: "Delete cover?",
      edit: "Edit Cover",
      new: "New image",
      select: "Select image",
      undefined: "(No image defined)",
      upload: "Upload",
    },
  },
} satisfies Translation;

// eslint-disable-next-line import/no-default-export
export default en;
