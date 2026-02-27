"use client";

import { EpisodeHistoryList } from "#modules/episodes";
import { PageContent } from "#modules/ui-kit/layouts/PageContainer/PageContent";

export default function EpisodesHistoryPage() {
  return <PageContent>
    <EpisodeHistoryList />
  </PageContent>;
}
