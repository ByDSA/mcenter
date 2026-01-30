import { ClientPage } from "./ClientPage";

export type Params = {
  id: string;
};

interface PageProps {
  params: Promise<Params>;
}

export default function Page( { params }: PageProps) {
  return <ClientPage params={params}/>;
}
