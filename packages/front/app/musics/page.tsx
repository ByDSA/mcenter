import { redirect } from "next/navigation";
import { getUser } from "#modules/core/auth/server";

export default async function MusicsPage() {
  const user = await getUser();

  if (!user)
    redirect("/musics/search");
  else
    redirect("/musics/playlists");
}
