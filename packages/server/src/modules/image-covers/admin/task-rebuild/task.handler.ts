import path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { Job } from "bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import z from "zod";
import { ImageCoverTasks } from "$shared/models/image-covers/admin";
import { TaskHandler, TaskHandlerClass, TaskService } from "#core/tasks";
import { ImageCoversRepository } from "../../repositories";
import { generateImageVersions } from "../../generate-versions";
import { IMAGE_COVERS_FOLDER_PATH } from "../../utils";

const TASK_NAME = ImageCoverTasks.rebuildAll.name;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const progressSchema = TasksCrudDtos.TaskStatus.progressSchemaBase;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resultSchema = createOneResultResponseSchema(z.undefined());

type Progress = z.infer<typeof progressSchema>;
type Result = z.infer<typeof resultSchema>;

@Injectable()
@TaskHandlerClass()
export class ImageCoversRebuildAllTaskHandler implements TaskHandler<undefined, Result> {
  private readonly logger = new Logger(ImageCoversRebuildAllTaskHandler.name);

  constructor(
    private readonly repo: ImageCoversRepository,
    private readonly taskService: TaskService,
  ) {
  }

  readonly taskName = TASK_NAME;

  async addTask(
    _payload: undefined,
    options?: Partial<TasksCrudDtos.CreateTask.TaskOptions>,
  ) {
    await this.taskService.assertJobIsNotRunningOrPendingByName(TASK_NAME);

    const job = await this.taskService.addTask<undefined>(
      TASK_NAME,
      undefined,
      {
        ...options,
      },
    );

    return job;
  }

  async execute(_payload: undefined, job: Job): Promise<Result> {
    const updateProgress = async (p: Progress) => {
      return await job.updateProgress(p);
    };

    await updateProgress( {
      message: "Starting",
      percentage: 0,
    } );

    const allImageCovers = await this.repo.getAll();

    await updateProgress( {
      message: "Got all " + allImageCovers.length + " image covers",
      percentage: 1,
    } );

    let i = 0;

    for (const imageCover of allImageCovers) {
      i++;
      const updatedVersions = await generateImageVersions( {
        filePath: path.join(
          IMAGE_COVERS_FOLDER_PATH,
          imageCover.id.slice(-2),
          imageCover.versions.original,
        ),
      } );

      await this.repo.patchOneByIdAndGet(imageCover.id, {
        entity: {
          versions: updatedVersions,
        },
      } );
      await updateProgress( {
        message: "Rebuilt: " + imageCover.metadata.label,
        percentage: (100 - 1) / allImageCovers.length * i,
      } );
    }

    await updateProgress( {
      message: "Done!",
      percentage: 100,
    } );

    return {
      data: undefined,
    };
  }
}
