"use client";

import { useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeTasks } from "$shared/models/episodes/admin";
import { MusicTasks } from "$shared/models/musics/admin";
import { assertIsDefined } from "$shared/utils/validation";
import styles from "./Page.module.css";
import { backendUrl } from "#modules/requests";
import { streamTaskStatus } from "#modules/tasks";

type Action = {
  path: string;
  name?: string;
} & (
  {
      type: "action";
  } | {
      type: "task";
      taskName: string;
  }
);
const ACTIONS: Action[] = [
  {
    path: PATH_ROUTES.episodes.admin.updateLastTimePlayed.path,
    name: "Episodes: updateLastTimePlayed",
    type: "action",
  },
  {
    path: PATH_ROUTES.episodes.admin.fileInfoUpdateSaved.path,
    name: "Episodes: update file-info saved",
    type: "action",
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
    path: PATH_ROUTES.logs.path,
    name: "Get logs",
    type: "action",
  },
];

export default function Page() {
  const [text, setText] = useState("");
  let finalText = text;

  try {
    const parsedText = JSON.parse(text);

    finalText = JSON.stringify(parsedText, null, 2);
  } catch {
    // Si no es JSON, lo dejamos como está
  }

  return (
    <>
      <ul>
        {ACTIONS.map((action: Action) => (
          <li key={action.path}><a onClick={async ()=>{
            if (action.type === "action") {
              await callAction( {
                setText,
                path: action.path,
              } );
            } else if (action.type === "task") {
              const response = await fetch(
                backendUrl(action.path),
              ).then(r=> r.json());
              const taskId = response.data?.job?.id;

              assertIsDefined(taskId);

              await streamTaskStatus( {
                url: backendUrl(PATH_ROUTES.tasks.statusStream.withParams(taskId)),
                taskName: action.taskName,
                // eslint-disable-next-line require-await
                onListenStatus: async (status) => {
                  let txt: string;

                  if (status.status === "active") {
                    if ("message" in status.progress)
                      txt = status.progress.message;
                    else
                      txt = JSON.stringify(status.progress, null, 2);
                  } else if (status.status === "completed")
                    txt = JSON.stringify(status.returnValue, null, 2);
                  else
                    txt = JSON.stringify(status, null, 2);

                  setText(txt);

                  return status;
                },
              } );
            }
          }}>{action.name ?? action.path}</a></li>
        ))}
      </ul>

      <p>Out:</p>
      {textArea(finalText)}
    </>
  );
}

type ActionParams = {
  setText: (text: string)=> void;
  path: string;
};
async function callAction( { setText: useText, path }: ActionParams) {
  const fullUrl = backendUrl(path);

  useText(`Loading: ${ fullUrl } ...`);
  const response = await fetch(fullUrl);
  const responseText = await response.text();
  let txt: string;

  try {
    const formattedText = JSON.stringify(JSON.parse(responseText), null, 2);

    txt = formattedText;
  } catch {
    txt = responseText;
  }
  useText(txt);

  // Text area con scroll bottom:
  const tArea = document.querySelector("textarea");

  setTimeout(()=>{
    if (tArea)
      tArea.scrollTop = tArea.scrollHeight;
  }, 1);
}

function textArea(txt: string) {
  return (
    <textarea className={styles.log} rows={20} style={{
      width: "100%",
      margin: "0.5em 1em",
      overflowX: "auto",
      whiteSpace: "pre",
    }} readOnly value={txt} />
  );
}
