import { Module, Global, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Database } from "./database";

@Global()
@Module( {
  imports: [],
  providers: [
    Database,
  ],
  exports: [],
} )
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private db: Database,
  ) { }

  async onModuleInit() {
    await this.db.connect();
  }

  async onModuleDestroy() {
    if (this.db.isConnected())
      await this.db.disconnect();
  }
}
