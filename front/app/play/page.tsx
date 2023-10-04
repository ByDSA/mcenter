/* eslint-disable require-await */

"use client";

import List from "./List";

export default function Play() {
  return (
    <div className="extra-margin">
      <h1 className="title">
          Play
      </h1>

      <h2>Streams</h2>
      {
        <List />
      }
    </div>
  );
}
