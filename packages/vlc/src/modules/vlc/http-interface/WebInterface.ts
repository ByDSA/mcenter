import querystring from "node:querystring";
import { UnauthorizedError, UnprocessableEntityError } from "#shared/utils/http";
import { XMLParser } from "fast-xml-parser";
import { StatusQuery } from "./StatusQuery";
import { PlaylistResponse, StatusResponse, assertIsPlaylistResponse, assertIsStatusResponse } from "./responses";

enum XMLFile {
  status = "status.xml",
  playlist = "playlist.xml",
}

type Params = {
  port?: number;
  password: string;
  host?: string;
};
export class VLCWebInterface {
  #password: string;

  #port: number;

  #host: string;

  #headers;

  constructor( { port, password, host }: Params) {
    this.#port = port ?? 8080;
    this.#password = password;
    this.#host = host ?? "127.0.0.1";

    this.#headers = new Headers( {

      Authorization: `Basic ${ btoa(`:${ this.#password }`) }`,
    } );
  }

  async #fetchSecureWithHeadersJson(file: XMLFile, query?: StatusQuery): Promise<unknown | null> {
    const queryStr = query ? `?${querystring.stringify(query)}` : "";
    const url = `http://${this.#host}:${this.#port}/requests/${file}${queryStr}`;
    const response = await fetch(url, {
      headers: this.#headers,
    } )
      .catch(e => {
        if (e instanceof TypeError && e.cause instanceof Error && JSON.stringify(e.cause).includes("ECONNREFUSED"))
          return null;

        console.error(JSON.stringify(e, null, 2));

        return null;
      } );

    if (!response)
      return null;

    switch (response.status) {
      case 200:
        break;
      case 401:
        throw new UnauthorizedError();
      case 404:
        return null;
      default:
        throw new Error(`Unknown error: ${response.status}`);
    }

    return response.text()
      .then(text => text.slice(text.indexOf("\n") + 1)) // quitar línea ?xml
      .then(text => new XMLParser( {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      } ).parse(text));
  }

  async #fetchSecureStatus(query?: StatusQuery): Promise<StatusResponse | null> {
    const ret = await this.#fetchSecureWithHeadersJson(
      XMLFile.status,
      query,
    ) as Promise<StatusResponse>;

    if (!ret)
      return null;

    try {
      assertIsStatusResponse(ret);
    } catch (e) {
      if (e instanceof Error)
        console.error(new UnprocessableEntityError(e.message));
      else
        console.log(e);

      return null;
    }

    return ret;
  }

  fetchSecureTogglePause() {
    return this.#fetchSecureStatus( {
      command: "pl_pause",
    } );
  }

  fetchSecureStop() {
    return this.#fetchSecureStatus( {
      command: "pl_stop",
    } );
  }

  fetchSecureNext() {
    return this.#fetchSecureStatus( {
      command: "pl_next",
    } );
  }

  fetchSecurePrevious() {
    return this.#fetchSecureStatus( {
      command: "pl_previous",
    } );
  }

  fetchDelete(id: number) {
    return this.#fetchSecureStatus( {
      command: "pl_delete",
      id,
    } );
  }

  fetchEmpty() {
    return this.#fetchSecureStatus( {
      command: "pl_empty",
    } );
  }

  fetchSecureToggleFullscreen() {
    return this.#fetchSecureStatus( {
      command: "fullscreen",
    } );
  }

  fetchVolume(val: number | string) {
    return this.#fetchSecureStatus( {
      command: "volume",
      val: val.toString(),
    } );
  }

  fetchSecureSeek(val: number | string) {
    return this.#fetchSecureStatus( {
      command: "seek",
      val: val.toString(),
    } );
  }

  fetchPlay(id: number) {
    return this.#fetchSecureStatus( {
      command: "pl_play",
      id,
    } );
  }

  async fetchSecurePlaylist(): Promise<PlaylistResponse | null> {
    const ret = await this.#fetchSecureWithHeadersJson(XMLFile.playlist);

    if (!ret)
      return null;

    try {
      assertIsPlaylistResponse(ret);
    } catch (e) {
      if (e instanceof Error)
        console.error(new UnprocessableEntityError(e.message));
      else
        console.log(e);

      return null;
    }

    return ret;
  }

  fetchSecureShowStatus(): Promise<StatusResponse | null> {
    return this.#fetchSecureStatus();
  }
}
