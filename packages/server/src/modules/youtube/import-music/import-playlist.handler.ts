import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Job } from "bullmq";
import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { TasksCrudDtos } from "$shared/models/tasks";
import { TaskHandlerClass, TaskHandler, TaskService } from "#core/tasks";
import { DownloadResult } from "./youtube-download-music.service";
import { YoutubeImportMusicService } from "./service";

type Payload = YoutubeCrudDtos.ImportPlaylist.CreateTask.Payload;
type Result = YoutubeCrudDtos.ImportPlaylist.Result;
type Progress = YoutubeCrudDtos.ImportPlaylist.TaskStatus.Progress;
const { payloadSchema } = YoutubeCrudDtos.ImportPlaylist.CreateTask;
const TASK_NAME = "youtube-import-music-playlist";

@Injectable()
@TaskHandlerClass()
export class YoutubeImportMusicPlaylistTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(YoutubeImportMusicPlaylistTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly service: YoutubeImportMusicService,
  ) {}

  async execute(payload: Payload, job: Job): Promise<Result> {
    const previousProgress = (job.progress || null) as Progress | null;

    if (previousProgress === null) {
      await job.updateProgress( {
        percentage: 0,
        message: "Starting task",
      } satisfies Progress);
    }

    const classification = previousProgress?.classification ?? {
      done: [],
      failed: [],
      ignored: [],
      remaining: [],
    };
    const created = previousProgress?.created ?? {};

    classification.remaining = previousProgress?.classification?.remaining
      ?? await this.service.getPlaylistVideoIds(payload.id);

    const min = 5;
    const max = 95;
    const length = classification.remaining.length
    + classification.done.length
    + classification.ignored.length;

    for (let i = 0; i < classification.remaining.length; i++) {
      let progressIndex = classification.done.length
        + classification.ignored.length
        + i;
      const videoId = classification.remaining[i];
      const percentage = min + ((progressIndex / length) * (max - min));

      await job.updateProgress( {
        percentage,
        message: `Downloading music (${progressIndex + 1} of ${length}): ${videoId}`,
        created,
        classification,
      } satisfies Progress);

      if (classification.done.includes(videoId) || classification.ignored.includes(videoId)) {
        classification.remaining = classification.remaining.filter(id => id !== videoId);
        i--;
        continue;
      }

      const downloadResult: DownloadResult = await this.service.downloadOne(videoId);

      try {
        const createdInfo = await this.service.createNewMusic(downloadResult);

        created[videoId] = {
          music: createdInfo.music,
          fileInfo: createdInfo.fileInfo,
        };
        classification.done.push(videoId);
      } catch (error) {
        await this.service.deleteDownloadedFile(downloadResult);

        if (!(error instanceof UnprocessableEntityException)) {
          if (!classification.failed.includes(videoId))
            classification.failed.push(videoId);

          await job.updateProgress( {
            percentage,
            message: `Failed creating music (${progressIndex + 1} of ${length}): ${videoId}`,
            created,
            classification,
          } satisfies Progress);
          throw error;
        }

        classification.ignored.push(videoId);
      }

      if (classification.failed.includes(videoId))
        classification.failed = classification.failed.filter(id => id !== videoId);

      classification.remaining = classification.remaining.filter(id => id !== videoId);
      i--;
    }

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
      created,
      classification,
    } satisfies Progress);

    return {
      playlistId: payload.id,
      created,
      classification,
    };
  }

  async addTask(payload: Payload, options?: Partial<TasksCrudDtos.CreateTask.TaskOptions>) {
    const job = await this.taskService.addTask<Payload>(
      TASK_NAME,
      payloadSchema.parse(payload),
      options,
    );

    return job;
  }
}
