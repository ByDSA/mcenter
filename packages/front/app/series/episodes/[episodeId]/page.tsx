import { ClientPage } from "./ClientPage";

export type Params = {
  episodeId: string;
};

interface PageProps {
  params: Promise<Params>;
}

export default function Page( { params }: PageProps) {
  return <ClientPage params={params} />;
}
