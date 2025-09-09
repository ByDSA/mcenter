// TODO: testing RKs0btOhOes
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { Injectable, Logger } from "@nestjs/common";
import { Playlist, parsePlaylistFromLines } from "./playlist.schema";

const execAsync = promisify(exec);

interface DownloadOptions {
  outputFolder?: string;
  outputName?: string;
  cookiesPath?: string;
}

export type DownloadResult = {
  videoId: string;
  fullpath: string;
  stdout: string;
  stderr: string;
};

@Injectable()
export class YoutubeDownloadMusicService {
  private readonly logger = new Logger(YoutubeDownloadMusicService.name);

  constructor() { }

  private ensureOutputFolderExists(outputFolder: string): void {
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, {
        recursive: true,
      } );
      this.logger.log(`Created output folder: ${outputFolder}`);
    }
  }

  private async checkYtDlpExists(): Promise<void> {
    try {
      await execAsync("yt-dlp --version");
      this.logger.log("yt-dlp is available");
    } catch {
      throw new Error("yt-dlp is not installed or not available in PATH. Please install it first.");
    }
  }

  async getPlaylistInfo(playlistId: string): Promise<Playlist> {
    await this.checkYtDlpExists();

    const command = `yt-dlp --dump-json --flat-playlist https://www.youtube.com/playlist?list=${playlistId}`;
    const { stdout } = await execAsync(command, {
      timeout: 300000, // 5 minutos timeout
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    } );

    this.logger.debug(stdout, "stdout");

    return parsePlaylistFromLines(stdout);
  }

  async download(str: string, options?: DownloadOptions): Promise<DownloadResult> {
    await this.checkYtDlpExists();

    const id = getIdFromYoutubeUrlStr(str);

    if (id === null)
      throw new Error("Invalid YouTube URL or ID");

    this.logger.log(`Starting download for video ID: ${id}`);

    // Construir la URL completa si solo se proporcionó el ID
    const url = str.startsWith("http") ? str : `https://www.youtube.com/watch?v=${id}`;
    // Nombre de salida (usar el proporcionado o el ID del video)
    const outputFolder = options?.outputFolder ?? ".";
    const outName = options?.outputName ?? "%(artist)s - %(title)s";
    // Construir el comando yt-dlp
    let cmd = [
      "yt-dlp",
      "-x",
      "--audio-format mp3",
      "-f \"bestaudio\"",
      "--audio-quality 0",
      "-c",
      `-o "${path.join(outputFolder, `${outName}.%(ext)s`)}"`,
      "--embed-thumbnail",
      "--add-metadata",
      "--verbose",
      `"${url}"`,
    ];

    // Agregar cookies si están configuradas
    if (options?.cookiesPath && fs.existsSync(options.cookiesPath)) {
      cmd.splice(-1, 0, `--cookies "${options.cookiesPath}"`);
      this.logger.log(`Using cookies from: ${options.cookiesPath}`);
    }

    const command = cmd.join(" ");

    this.ensureOutputFolderExists(outputFolder);

    this.logger.log(`Executing command: ${command}`);

    // Ejecutar el comando
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minutos timeout
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    } );

    this.logger.debug(stdout, "stdout");

    const extractAudioMatch = stdout.match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
    const fullpath: string = extractAudioMatch ? extractAudioMatch[1] : "";

    if (!fullpath)
      throw new Error("Could not determine downloaded file path from yt-dlp output");

    return {
      videoId: id,
      fullpath,
      stdout: stdout,
      stderr: stderr,
    };
  }
}

function getIdFromYoutubeUrlStr(str: string): string | null {
  const LONG_PRE = "youtube.com/watch?v=";
  const SHORT_PRE = "youtu.be/";
  let ret = str;

  // Handle long YouTube URLs (youtube.com/watch?v=VIDEO_ID)
  if (str.includes(LONG_PRE)) {
    const startIndex = str.indexOf(LONG_PRE) + LONG_PRE.length;

    ret = str.substring(startIndex);
    // Remove any additional parameters (like &t=123s)
    const ampersandIndex = ret.indexOf("&");

    if (ampersandIndex !== -1)
      ret = ret.substring(0, ampersandIndex);
  } else if (str.includes(SHORT_PRE)) {
    // Handle short YouTube URLs (youtu.be/VIDEO_ID)
    const startIndex = str.indexOf(SHORT_PRE) + SHORT_PRE.length;

    ret = str.substring(startIndex);
    // Remove any additional parameters (like ?t=123s)
    const questionMarkIndex = ret.indexOf("?");

    if (questionMarkIndex !== -1)
      ret = ret.substring(0, questionMarkIndex);
  } else if (str.length === 11 && /^[a-zA-Z0-9_-]+$/.test(str))
    // Handle cases where only the video ID is provided
    ret = str;
  else if (str.includes("m.youtube.com/watch?v=")) {
    // Handle mobile URLs (m.youtube.com)
    const mobilePrefix = "m.youtube.com/watch?v=";
    const startIndex = str.indexOf(mobilePrefix) + mobilePrefix.length;

    ret = str.substring(startIndex);
    const ampersandIndex = ret.indexOf("&");

    if (ampersandIndex !== -1)
      ret = ret.substring(0, ampersandIndex);
  } else
    return null;

  // Ensure we return only the 11-character video ID
  return ret.substring(0, 11);
}

export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtu\.be\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/m\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
    /^[a-zA-Z0-9_-]{11}$/, // Just the video ID
  ];

  return patterns.some(pattern => pattern.test(url));
}
