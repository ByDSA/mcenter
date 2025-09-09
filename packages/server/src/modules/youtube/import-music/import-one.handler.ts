import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Job, UnrecoverableError } from "bullmq";
import { YoutubeCrudDtos } from "$shared/models/youtube/dto/transport";
import { TasksCrudDtos } from "$shared/models/tasks";
import { TaskHandlerClass, TaskHandler, TaskService } from "#core/tasks";
import { DownloadResult } from "./youtube-download-music.service";
import { YoutubeImportMusicService } from "./service";

const TASK_NAME = "youtube-import-music-one";

type Payload = YoutubeCrudDtos.ImportOne.CreateTask.Payload;
const { payloadSchema } = YoutubeCrudDtos.ImportOne.CreateTask;

type Result = YoutubeCrudDtos.ImportOne.Result;
type Progress = YoutubeCrudDtos.ImportOne.TaskStatus.Progress;

@Injectable()
@TaskHandlerClass()
export class YoutubeImportMusicOneTaskHandler implements TaskHandler<Payload, Result> {
  private readonly logger = new Logger(YoutubeImportMusicOneTaskHandler.name);

  readonly taskName = TASK_NAME;

  constructor(
    private readonly taskService: TaskService,
    private readonly service: YoutubeImportMusicService,
  ) {}

  async execute(payload: Payload, job: Job): Promise<Result> {
    await job.updateProgress( {
      percentage: 0,
      message: "Downloading music from YouTube",
    } satisfies Progress);
    const downloadResult: DownloadResult = await this.service.downloadOne(payload.id);

    await job.updateProgress( {
      percentage: 90,
      message: "Creating new music",
    } satisfies Progress);

    let created: Result["created"];

    try {
      created = await this.service.createNewMusic(downloadResult);
    } catch (error) {
      await this.service.deleteDownloadedFile(downloadResult);

      if (error instanceof UnprocessableEntityException)
        throw new UnrecoverableError(error.message);

      throw error;
    }

    await job.updateProgress( {
      percentage: 100,
      message: "Done!",
    } satisfies Progress);

    return {
      videoId: downloadResult.videoId,
      created,
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
