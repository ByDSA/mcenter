import { Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { DiscoveryModule, ModuleRef } from "@nestjs/core";
import { Queue } from "bullmq";
import { QUEUE_NAME, TaskService } from "./task.service";
import { TaskController } from "./controller";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: process.env.REDIS_PORT ? +(process.env.REDIS_PORT) : 6379,
  username: "default",
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
};

@Module( {
  imports: [
    BullModule.forRoot( {
      connection,
    } ),
    BullModule.registerQueue( {
      name: QUEUE_NAME,
      connection,
      forceDisconnectOnShutdown: true,
    } ),
    DiscoveryModule, // Para auto-discovery
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
  ],
  exports: [TaskService],
} )
export class TasksModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksModule.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationBootstrap() {
    if (await this.connectionTest()) {
      this.logger.log("Tasks module initialized successfully");
      const queue = this.moduleRef.get<Queue>(getQueueToken(QUEUE_NAME), {
        strict: false,
      } );
      const jobs = await queue.getJobs(["waiting", "active"]);

      if (jobs.length > 0) {
        console.log("Jobs waiting/active en Redis:", jobs.length);
        jobs.forEach(job => {
          console.log(
            `Job ${job.id}: name=${job.name}, finishedOn=${job.finishedOn}, \
   failedReason=${job.failedReason}`,
          );
        } );
      }

      // await queue.clean(24 * 60 * 60 * 1000, 100, "completed"); // Jobs completados > 1 día
      // await queue.clean(7 * 24 * 60 * 60 * 1000, 100, "failed"); // Jobs fallidos > 7 días
      // console.log("✅ Jobs antiguos limpiados");
    } else
      this.logger.error("Tasks module failed to initialize");
  }

  private async connectionTest(): Promise<boolean> {
    try {
      // Obtener la queue con mejor manejo de errores
      const queue = this.moduleRef.get<Queue>(getQueueToken(QUEUE_NAME), {
        strict: false,
      } );

      if (!queue) {
        this.logger.error("No se pudo obtener la queue");

        return false;
      }

      // Acceder al cliente Redis de forma más segura
      const clientConnection = await queue.client;

      if (!clientConnection) {
        this.logger.error("No se pudo acceder al cliente Redis de la queue");

        return false;
      }

      // Configurar listeners ANTES de intentar conectar
      clientConnection.on("error", (err: any) => {
        this.logger.error("Redis: error event", err.message || err);
      } );

      clientConnection.on("close", () => {
        this.logger.warn("Redis: close event");
      } );

      // Intentar conectar explícitamente si está en modo lazy
      if (clientConnection.status === "wait" || clientConnection.status === "end") {
        this.logger.log("Iniciando conexión explícita...");
        await clientConnection.connect();
      }

      // Esperar un poco para que se establezca la conexión
      await this.waitForConnection(clientConnection, 5000);

      // Intentar el test solo si la conexión está lista
      if (clientConnection.status !== "ready")
        throw new Error(`Conexión no está lista. Estado: ${clientConnection.status}`);

      // Test básico: ping
      const pong = await clientConnection.ping();

      if (pong !== "PONG")
        this.logger.log(`Fallo en PING. Obtenido: ${pong}`);

      // Test de queue: añadir job
      const job = await queue.add(
        "test-task",
        {
          foo: "bar",
          timestamp: Date.now(),
        },
        {
          jobId: `test-${Date.now()}`,
          delay: 5_000,
          attempts: 1,
        },
      );
      // Recuperar el job
      const fetched = await queue.getJob(job.id!);

      if (fetched)
        await fetched.remove();

      return true;
    } catch (err) {
      this.logger.error("Error en connectionTest:", {
        message: (err as Error).message,
        name: (err as Error).name,
      } );

      return false;
    }
  }

  private waitForConnection(clientConnection: any, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout esperando conexión (${timeout}ms)`));
      }, timeout);

      if (clientConnection.status === "ready") {
        clearTimeout(timer);
        resolve();

        return;
      }

      const readyHandler = () => {
        clearTimeout(timer);
        clientConnection.removeListener("error", errorHandler);
        resolve();
      };
      const errorHandler = (err: any) => {
        clearTimeout(timer);
        clientConnection.removeListener("ready", readyHandler);
        reject(err);
      };

      clientConnection.once("ready", readyHandler);
      clientConnection.once("error", errorHandler);
    } );
  }
}
