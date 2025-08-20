"use client";

import { useState } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import styles from "./Page.module.css";

type Action = {
  path: string;
  name?: string;
};
const ACTIONS: Action[] = [
  {
    path: PATH_ROUTES.episodes.admin.updateLastTimePlayed.path,
    name: "Episodes: updateLastTimePlayed",
  },
  {
    path: PATH_ROUTES.episodes.admin.fileInfoUpdateSaved.path,
    name: "Episodes: update file-info saved",
  },
  {
    path: PATH_ROUTES.episodes.admin.addNewFiles.path,
    name: "Episodes: add new files",
  },
  {
    path: PATH_ROUTES.streams.fixer.path,
    name: "Streams: fixer (ensure all series have default stream)",
  },
  {
    path: PATH_ROUTES.musics.admin.fixInfo.path,
    name: "Musics: fix info (title, artist...)",
  },
  {
    path: PATH_ROUTES.musics.admin.searchDuplicates.path,
    name: "Musics: search duplicates",
  },
  {
    path: PATH_ROUTES.musics.admin.updateRemote.path,
    name: "Musics: update remote tree (FileInfo DB + Local files)",
  },
  {
    path: PATH_ROUTES.logs.path,
    name: "Get logs",
  },
];

export default function Page() {
  const [text, useText] = useState("");
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
        {ACTIONS.map(( { path, name }: Action) => (
          <li key={path}><a onClick={()=>callAction( {
            useText,
            path: path,
          } )}>{name ?? path}</a></li>
        ))}
      </ul>

      <p>Out:</p>
      {textArea(finalText)}
    </>
  );
}

type ActionParams = {
  useText: (text: string)=> void;
  path: string;
};
async function callAction( { useText, path }: ActionParams) {
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
