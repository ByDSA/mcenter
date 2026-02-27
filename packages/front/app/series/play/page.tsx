"use client";

import { PageContent } from "#modules/ui-kit/layouts/PageContainer/PageContent";
import { List } from "./List";

export default function Play() {
  return (
    <PageContent>
      <h1>Play</h1>

      <h2>Streams</h2>
      {
        <List />
      }
    </PageContent>
  );
}
