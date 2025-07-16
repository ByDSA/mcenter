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
    path: PATH_ROUTES.episodes.actions.updateLastTimePlayed.path,
    name: "Episodes: updateLastTimePlayed",
  },
  {
    path: PATH_ROUTES.episodes.actions.fileInfoUpdateSaved.path,
    name: "Episodes: update file-info saved",
  },
  {
    path: PATH_ROUTES.episodes.actions.addNewFiles.path,
    name: "Episodes: add new files",
  },
  {
    path: PATH_ROUTES.actions.fixer.path,
    name: "Fixer: streams-series",
  },
  {
    path: PATH_ROUTES.actions.log.path,
    name: "Log",
  },
];

export default function Page() {
  const [text, useText] = useState("");

  return (
    <>
      <h1>Actions</h1>

      <ul>
        {ACTIONS.map(( { path, name }: Action) => (
          <li key={path}><a onClick={()=>callAction( {
            useText,
            path: path,
          } )}>{name ?? path}</a></li>
        ))}
      </ul>

      <p>Out:</p>
      {textArea(text)}
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
}

function textArea(txt: string) {
  return (<textarea className={styles.log} rows={20} cols={60} readOnly value={txt} />);
}
