"use client";

import { useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { ImageCoverTasks } from "$shared/models/image-covers/admin";
import { MusicTasks } from "$shared/models/musics/admin";
import { assertIsDefined } from "$shared/utils/validation";
import { backendUrl } from "#modules/requests";
import { streamTaskStatus } from "#modules/tasks";
import { TaskJsonViewer, useResponsiveCollapseLength } from "#modules/tasks/TaskJsonViewer";
import { logger } from "#modules/core/logger";

type Action = {
  path: string;
  name: string;
} & (
  {
      type: "action";
  } | {
      type: "task";
      taskName: string;
  }
);
const ACTION_LOG_NAME = "Get logs";
const ACTIONS: Action[] = [
  {
    path: PATH_ROUTES.imageCovers.path + "/admin/rebuild-all",
    name: "Image Covers: rebuild all",
    type: "task",
    taskName: ImageCoverTasks.rebuildAll.name,
  },
  {
    path: PATH_ROUTES.episodes.admin.updateLastTimePlayed.path,
    name: "Episodes: updateLastTimePlayed",
    type: "task",
    taskName: EpisodeTasks.cache.updateLastTimePlayed.name,
  },
  {
    path: PATH_ROUTES.episodes.admin.fileInfoUpdateSaved.path,
    name: "Episodes: update file-info saved",
    type: "task",
    taskName: EpisodeTasks.updateFileInfoSaved.name,
  },
  {
    path: PATH_ROUTES.episodes.admin.addNewFiles.path,
    name: "Episodes: add new files",
    type: "task",
    taskName: EpisodeTasks.sync.name,
  },
  {
    path: PATH_ROUTES.streams.fixer.path,
    name: "Streams: fixer (ensure all series have default stream)",
    type: "action",
  },
  {
    path: PATH_ROUTES.musics.admin.fixInfo.path,
    name: "Musics: fix info (title, artist...)",
    type: "action",
  },
  {
    path: PATH_ROUTES.musics.admin.searchDuplicates.path,
    name: "Musics: search duplicates",
    type: "action",
  },
  {
    path: PATH_ROUTES.musics.admin.updateRemote.path,
    name: "Musics: update remote tree (FileInfo DB + Local files)",
    type: "task",
    taskName: MusicTasks.sync.name,
  },
  {
    path: PATH_ROUTES.musics.admin.updateFileInfos.path,
    name: "Musics: update file infos",
    type: "task",
    taskName: MusicTasks.updateFileInfos.name,
  },
  {
    path: PATH_ROUTES.logs.path,
    name: ACTION_LOG_NAME,
    type: "action",
  },
];

export default function Page() {
  const [text, setText] = useState<object>( {} );
  const collapseStringsAfterLength = useResponsiveCollapseLength();

  return (
    <>
      <ul>
        {ACTIONS.map((action: Action) => (
          <li key={action.path}><a onClick={async ()=>{
            if (action.type === "action") {
              await callAction( {
                name: action.name,
                setText,
                path: action.path,
              } );
            } else if (action.type === "task") {
              const response = await fetch(
                backendUrl(action.path),
                {
                  credentials: "include",
                },
              ).then(r=> r.json());
              const taskId = response.data?.job?.id;

              if (response.errors) {
                logger.error(response.errors[0]);

                return;
              }

              assertIsDefined(taskId);

              await streamTaskStatus( {
                url: backendUrl(PATH_ROUTES.tasks.statusStream.withParams(taskId)),
                taskName: action.taskName,
                // eslint-disable-next-line require-await
                onListenStatus: async (status) => {
                  if (status.status === "active")
                    setText(status.progress);
                  else if (status.status === "completed")
                    setText(status.returnValue);
                  else
                    setText(status);

                  return status;
                },
              } );
            }
          }}>{action.name}</a></li>
        ))}
      </ul>

      <hr/>
      <TaskJsonViewer
        key={collapseStringsAfterLength} // Fuerza el re-renderizado cuando cambia
        collapseStringsAfterLength={collapseStringsAfterLength}
        value={text}
      />
    </>
  );
}

type ActionParams = {
  setText: (text: object)=> void;
  path: string;
  name: string;
};
async function callAction( { setText: useText, path, name }: ActionParams) {
  const fullUrl = backendUrl(path);

  useText( {
    message: `Loading: ${ fullUrl } ...`,
  } );
  const response = await fetch(fullUrl, {
    credentials: "include",
  } );

  try {
    let json = await response.json();

    if (name === ACTION_LOG_NAME)
      json = (json as string[]).map(l=>l.substring(11)).reverse();

    useText(json);
  } catch {
    try {
      useText( {
        message: await response.text(),
      } );
    } catch {
      useText( {
        message: "",
      } );
    }
  }
}
