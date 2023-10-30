"use client";

import { getBackendUrl } from "#modules/utils";
import { useState } from "react";
import styles from "./Page.module.css";

const ACTIONS_URL = `${getBackendUrl()}/api/actions`;

type Action = {
  url: string;
  name?: string;
};
const ACTIONS: Action[] = [
  {
    url: "episodes/updateLastTimePlayed",
    name: "Episodes: updateLastTimePlayed",
  },
  {
    url: "episodes/file-info/update/saved",
    name: "Episodes: update file-info saved",
  },
  {
    url: "episodes/add-new-files",
    name: "Episodes: add new files",
  },
  {
    url: "fixer",
    name: "Fixer: streams-series",
  },
  {
    url: "log",
    name: "Log",
  },
];

export default function Page() {
  const [text, useText] = useState("");

  return (
    <>
      <h1 className="title">
          Actions
      </h1>

      <ul>
        {ACTIONS.map(( {url, name}: Action) => (
          <li key={url}><a onClick={()=>callAction( {
            useText,
            url,
          } )}>{name ?? url}</a></li>
        ),
        )}
      </ul>

      <p>Out:</p>
      {textArea(text)}
    </>
  );
}

type ActionParams = {
  useText: (text: string)=> void;
  url: string;
};
async function callAction( {useText, url}: ActionParams) {
  const fullUrl = `${ACTIONS_URL}/${url}`;

  useText(`Loading: ${ fullUrl } ...`);
  const response = await fetch(fullUrl);
  const responseText = await response.text();
  let txt: string;

  try {
    const formattedText = JSON.stringify(JSON.parse(responseText), null, 2);

    txt = formattedText;
  } catch (e) {
    txt = responseText;
  }
  useText(txt);
}

function textArea(txt: string) {
  return (<textarea className={styles.log} rows={20} cols={60} readOnly value={txt} />);
}
