import { AUTH_ES } from "../../auth/i18n";
import { BaseTranslation } from "../i18n-types";

const es = {
  uikit: {
    forms: {
      errors: {
        matchFields: "Los campos deben coincidir.",
        requiredField: "Campo obligatorio.",
        invalidEmail: "Formato de email no válido.",
      },
      optionalField: "opcional",
      unsavedDataModalTitle: "Datos sin guardar.",
      unsavedData: "Hay datos sin guardar.",
      labels: {
        name: "Nombre",
        email: "Email",
      },
    },
    modals: {
      confirmDelete: "Confirmar borrado",
      confirmClose: "¿Seguro que quieres cerrar?",
    },
    actions: {
      save: "Guardar",
      edit: "Editar",
      create: "Crear",
      delete: "Eliminar",
      cancel: "Cancelar",
      confirm: "Sí",
      close: "Cerrar",
      change: "Cambiar",
      new: "Nueva",
    },
  },
  core: {
    auth: AUTH_ES,
    errors: {
      notFound: {
        title: "😨 Ups... 😨",
        message: "Elemento no encontrado.",
      },
      forbidden: {
        title: "403 - Acceso Denegado",
        message: "No tienes permisos para acceder a esta página.",
      },
      unauthorized: {
        unauthorized: "Sin autorización",
      },
    },
    user: {
      settings: {
        menuLabel: "Ajustes",
      },
      menuAriaLabel: "Menú de usuario",
      profile: {
        menuLabel: "Mi perfil",
        title: "Perfil",
        publicName: "Nombre público",
        firstName: "Nombre",
        lastName: "Apellidos",
        roles: "Roles",
        music: "Música",
        favoritePlaylist: {
          favoritePlaylist: "Playlist favorita",
          none: "<Ninguna>",
        },
      },
    },
  },
  main: {
    welcome: "Bienvenido a MCenter",
    menu: {
      home: "Inicio",
      music: "Música",
      series: "Series",
      movies: "Películas",
      remote: "Remoto",
    },
    pwa: {
      button: "Instalar shortcut",
      appNamePrompt: "¿Qué nombre quieres para tu App?",
      title: "Instalar como App",
      text: "Abre en navegador para instalar",
      installingError: "No se pudo instalar",
      errorNoEvent: "Intento de instalación sin evento capturado",
      installed: "App instalada con éxito",
      installApp: "Instalar App",
      appAddressWillBe: "La dirección de la App será",
    },
  },

  // ─── Reutilizables en toda la app ──────────────────────────────────────────
  common: {
    upload: {
      unknownType: "Tipo desconocido",
      pending: "Pendiente de subir",
      uploaded: "¡Subido!",
    },
    lists: {
      empty: "No hay ningún elemento en esta lista.",
    },
    dates: {
      today: "hoy",
      yesterday: "ayer",
      date: "Fecha",
      duration: "Duración",
      playedAt: "Hora de reproducción",
    },
  },

  // ─── Administración ────────────────────────────────────────────────────────
  admin: {
    menuLabel: "Admin",
    tasks: {
      tabs: {
        doTasks: "Ejecutar tareas",
        taskManager: "Gestor de tareas",
      },
      noTasksFound: "No se encontraron tareas.",
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
      player: "{{count:reproductor|reproductores}}",
      remote: {
        title: "Reproductores",
        noPlayers: "No se ha detectado ningún reproductor remoto.",
        status: {
          offline: "Offline",
          closed: "Closed",
          open: "Open",
          unknown: "Desconocido",
        },
        errorSse: "Error parseando datos SSE",
      },
      controls: {
        prev: "Anterior",
        next: "Siguiente",
        rewind10: "Ir atrás 10 segundos",
        forward10: "Ir adelante 10 segundos",
        stop: "Detener",
        repeat: "Repetición",
        shuffle: "Aleatoriedad",
        close: "Cerrar",
        fullPlayer: "Reproductor completo",
        play: "Reproducir",
        pause: "Pausar",
        resume: "Reanudar",
      },
      queue: {
        title: "Lista de reproducción",
        empty: "No hay elementos en la lista",
      },
      effects: {
        title: "Efectos",
      },
      settings: {
        goToPlaylist: "Ir a la playlist",
        playModified: "Reproducir modificación",
      },
    },
    musics: {
      count: "{count:number} {{count:canción|canciones}}",
      lists: {
        tab: "Listas",
        playlists: {
          oneNotFound: "Playlist no encontrada",
          oneCreated: "Nueva playlist creada",
          new: "Nueva playlist",
          select: "Seleccionar playlist",
          none: "Ninguna",
        },
        smartPlaylists: {
          oneCreated: "Nueva Smart Playlist creada",
          new: "Nueva Smart Playlist",
          play: "Reproducir Smart Playlist",
          playModified: "Reproducir modificación",
          invalidQuery: "Query inválida",
        },
      },
      search: {
        placeholder: "Buscar música...",
        oneNotFound: "Música no encontrada",
      },
      upload: {
        fromYoutube: "Desde YouTube",
        fromLocal: "Desde local",
        sectionTitle: "Músicas subidas",
        noneUploaded: "No has subido músicas todavía.",
        youtubeUrlPlaceholder: "URL del vídeo o playlist",
        attempt: "(Intento {current:number}/{max:number})",
        processing: "Procesando tarea",
        tab: "Subir",
      },
      edit: {
        confirmDelete: "¿Estás seguro de borrar esta música?",
        optionalProps: "Propiedades opcionales",
        loadError: "Error al cargar la música",
        disabled: "Desactivado",
        spotifyId: "Spotify ID",
        tagsHint: "Tags (usa # para tags globales)",
        editFiles: "Editar archivos",
      },
      info: {
        userTags: "User Tags",
      },
      autoplay: {
        clickTo: "Click para",
        playMusic: "Reproducir música",
      },
      labels: {
        artist: "Artista",
        album: "Álbum",
        year: "Año",
        country: "País",
        game: "Juego",
      },
    },
    episodes: {
      count: "{count:number} episodio{{s}}",
      edit: {
        confirmDelete: "¿Estás seguro de que deseas eliminar este episodio permanentemente?",
        loadError: "Error al cargar el episodio",
        episode: "Episodio",
        hash: "Hash",
        size: "Tamaño",
      },
      search: {
        oneNotFound: "Episodio no encontrado",
      },
      series: {
        lists: {
          tab: "Explorar",
        },
        search: {
          oneNotFound: "Serie no encontrada",
        },
        seasons: {
          count: "{count:number} temporada{{s}}",
          noSeasons: "No se encontraron temporadas.",
        },
        edit: {
          confirmDelete: "¿Estás seguro de que deseas eliminar esta serie?",
        },
        episodes: {
          noEpisodes: "No hay episodios en esta temporada.",
          lastSeen: "Visto por última vez: {date}",
        },
        actions: {
          checkAvailability: "Comprobar disponibilidad",
          uploadFromLocal: "Desde local",
        },
        labels: {
          newTitle: "Nueva serie",
          editTitle: "Editar serie",
          name: "Nombre",
        },
      },
      labels: {
        key: "Key",
        start: "Inicio",
        end: "Fin",
      },
    },
    resources: {
      visibility: {
        public: "Lista pública",
        private: "Lista privada",
      },
      history: {
        history: "Historial",
        deleteEntry: "¿Borrar entrada?",
        removeFromHistory: "Quitar del historial",
        latestViews: "Ver últimas reproducciones",
        loadError: "Error al cargar el historial",
        neverPlayed: "No hay ninguna reproducción.",
      },
      share: {
        autoplay: "Autoplay",
        includeToken: "Incluir token",
      },
      labels: {
        title: "Título",
        tags: "Tags",
        image: "Imagen",
        weight: "Peso",
        path: "Path",
        query: "Query",
        createdAt: "Creado",
        addedAt: "Añadido",
        updatedAt: "Actualizado",
        timestamps: "Tiempos",
        lastTimePlayed: "Última reproducción",
        releasedOn: "Lanzada",
        slug: "Url slug",
        visibility: "Visibilidad",
      },
    },
    imageCover: {
      label: "Etiqueta",
      current: "Actual",
      replaceImage: "Reemplazar Imagen",
      deleteConfirm: "¿Borrar cover?",
      edit: "Editar Cover",
      new: "Nueva imagen",
      select: "Seleccionar imagen",
      undefined: "(Imagen no definida)",
      upload: "Subir",
    },
  },
} satisfies BaseTranslation;

// eslint-disable-next-line import/no-default-export
export default es;
