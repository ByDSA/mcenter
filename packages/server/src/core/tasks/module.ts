import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { DiscoveryModule } from "@nestjs/core";
import { TaskService } from "./task.service";
import { TaskController } from "./controller";

@Module( {
  imports: [
    BullModule.forRoot( {
      connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: process.env.REDIS_PORT ? +(process.env.REDIS_PORT) : 6379,
        username: "default",
        password: process.env.REDIS_PASSWORD,
      },
    } ),
    BullModule.registerQueue( {
      name: "tasks",
    } ),
    DiscoveryModule, // Para auto-discovery
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
  ],
  exports: [TaskService],
} )
export class TasksModule implements OnModuleInit {
  private readonly logger = new Logger(TasksModule.name);

  onModuleInit() {
    this.logger.log("Tasks module initialized successfully");
  }
}
