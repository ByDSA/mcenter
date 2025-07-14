import { Module, Global, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Database } from "./Database";

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
    await this.db.disconnect();
  }
}
