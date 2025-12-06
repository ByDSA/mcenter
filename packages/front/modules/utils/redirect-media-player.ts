import { isMediaPlayerUserAgent } from "$shared/utils/http/user-agent";
import { SearchParams } from "next/dist/server/request/search-params";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  url: string;
  searchParams?: Promise<SearchParams>;
};
export async function redirectIfMediaPlayer(props: Props) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  if (isMediaPlayerUserAgent(userAgent)) {
    let fullUrl = props.url;
    const searchParams = await props.searchParams;

    if (searchParams && Object.entries(searchParams).length > 0)
      fullUrl += `?${new URLSearchParams(searchParams as Record<string, string>).toString()}`;

    redirect(fullUrl);
  }
}
