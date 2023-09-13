import ServiceUnavailableError from "#utils/http/validation/ServiceUnavailableError";
import UnauthorizedError from "#utils/http/validation/UnauthorizedError";
import UnprocessablEntityError from "#utils/http/validation/UnprocessableEntityError";
import { XMLParser } from "fast-xml-parser";
import querystring from "node:querystring";
import PlaylistResponse, { assertIsPlaylistResponse } from "./PlaylistResponse";
import StatusQuery from "./StatusQuery";
import StatusResponse, { assertIsStatusResponse } from "./StatusResponse";

enum XMLFile {
  status = "status.xml",
  playlist = "playlist.xml",
}

type Params = {
  port?: number;
  password: string;
  host?: string;
};
export default class WebInterface {
  #password: string;

  #port: number;

  #host: string;

  #headers;

  constructor( {port, password, host}: Params) {
    this.#port = port ?? 8080;
    this.#password = password;
    this.#host = host ?? "127.0.0.1";

    this.#headers = new Headers( {
      Authorization: `Basic ${ btoa(`:${ this.#password }`) }`,
    } );
  }

  #fetchWithHeadersJson(file: XMLFile, query?: StatusQuery): Promise<unknown> {
    const queryStr = query ? `?${querystring.stringify(query)}` : "";

    return fetch(`http://${this.#host}:${this.#port}/requests/${file}${queryStr}`, {
      headers: this.#headers,
    } )
      .catch(e => {
        if (e instanceof TypeError && e.cause instanceof Error && e.cause.toString().includes("ECONNREFUSED"))
          throw new ServiceUnavailableError("VLC is not running with the web interface enabled");

        throw e;
      } )
      .then(response => {
        switch (response.status) {
          case 200:
            return response;
          case 401:
            throw new UnauthorizedError();
          default:
            throw new Error(`Unknown error: ${response.status}`);
        }
      } )
      .then(response => response.text())
      .then(text => text.slice(text.indexOf("\n") + 1)) // quitar línea ?xml
      .then(text => new XMLParser( {
        ignoreAttributes: false,
        attributeNamePrefix : "@_",
      } ).parse(text));
  }

  async #fetchStatus(query?: StatusQuery): Promise<StatusResponse> {
    const ret = await this.#fetchWithHeadersJson(XMLFile.status, query) as Promise<StatusResponse>;

    try {
      assertIsStatusResponse(ret);
    } catch (e) {
      if (e instanceof Error)
        throw new UnprocessablEntityError(e.message);

      throw e;
    }

    return ret;
  }

  fetchTogglePause() {
    return this.#fetchStatus( {
      command: "pl_pause",
    } );
  }

  fetchStop() {
    return this.#fetchStatus( {
      command: "pl_stop",
    } );
  }

  fetchNext() {
    return this.#fetchStatus( {
      command: "pl_next",
    } );
  }

  fetchPrevious() {
    return this.#fetchStatus( {
      command: "pl_previous",
    } );
  }

  fetchDelete(id: number) {
    return this.#fetchStatus( {
      command: "pl_delete",
      id,
    } );
  }

  fetchEmpty() {
    return this.#fetchStatus( {
      command: "pl_empty",
    } );
  }

  fetchToggleFullscreen() {
    return this.#fetchStatus( {
      command: "fullscreen",
    } );
  }

  fetchVolume(val: number | string) {
    return this.#fetchStatus( {
      command: "volume",
      val: val.toString(),
    } );
  }

  fetchSeek(val: number | string) {
    return this.#fetchStatus( {
      command: "seek",
      val: val.toString(),
    } );
  }

  fetchPlay(id: number) {
    return this.#fetchStatus( {
      command: "pl_play",
      id,
    } );
  }

  async fetchPlaylist(): Promise<PlaylistResponse> {
    const ret = await this.#fetchWithHeadersJson(XMLFile.playlist);

    try {
      assertIsPlaylistResponse(ret);
    } catch (e) {
      console.log(e);

      if (e instanceof Error)
        throw new UnprocessablEntityError(e.message);

      throw e;
    }

    return ret;
  }

  fetchShowStatus(): Promise<StatusResponse> {
    return this.#fetchStatus();
  }
}