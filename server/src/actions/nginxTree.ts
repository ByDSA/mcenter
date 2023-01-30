import axios from "axios";
import { JSDOM } from "jsdom";

export type FileNode = {
    name: string;
    type: string;
    relativeUri: string;
    uri: string;
    children?: FileNode[];
};

export type Options = {
    maxLevel: number;
};

type Params = {
    uri: string;
    relativeUri: string;
    level: number;
    promises: Promise<FileNode[]>[];
    options: Options;
};

export async function getSerieTreeRemote(uri: string, options: Options = {
  maxLevel: 0,
} ): Promise<FileNode[] | null> {
  if (!uri.endsWith("/"))
    // eslint-disable-next-line no-param-reassign
    uri += "/";

  const promises: Promise<FileNode[]>[] = [];

  try {
    const nodes = await getPageElements( {
      uri,
      relativeUri: "",
      level: 1,
      promises,
      options,
    } );

    await Promise.all(promises);

    return nodes;
  } catch (e) {
    return null;
  }
}

async function getPageElements( { uri, relativeUri, promises, level, options }: Params): Promise<FileNode[]> {
  console.log(`Requesting ${ uri}`);
  const response = await axios.get(uri);
  const data: string = await response.data;
  const dom = new JSDOM(data);
  const ret: FileNode[] = [];

  dom.window.document.querySelectorAll("tr").forEach((row: Element) => {
    let name: string = "";
    let alt: string = "";

    row.querySelectorAll("td").forEach((column, index) => {
      if (index === 0)
        alt = (<HTMLImageElement>column.querySelector("img")).alt;
      else if (index === 1) {
        const anchor = <HTMLAnchorElement>column.querySelector("a");

        name = anchor.href;
      }
    } );

    const node: FileNode = {
      name,
      type: alt,
      uri: uri + name,
      relativeUri: relativeUri + name,
    };
    const maxLevelCondition = (options.maxLevel <= 0 || level < options.maxLevel);

    if (alt === "[DIR]" && maxLevelCondition) {
      const promise: Promise<FileNode[]> = getPageElements( {
        uri: node.uri,
        relativeUri: node.relativeUri,
        promises,
        level: level + 1,
        options,
      } ).then(nodes => {
        node.children = nodes;

        return nodes;
      } );

      promises.push(promise);
    }

    if (name || alt)
      ret.push(node);
  } );

  return ret;
}