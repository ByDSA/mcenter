import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MeiliSearch } from "meilisearch";
import { MusicsIndexService } from "./indexes/musics.service";

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);

  constructor(
    private readonly meiliClient: MeiliSearch,
    private readonly musicsIndexService: MusicsIndexService,
  ) {}

  async onModuleInit() {
    await this.testConnection();
    await this.initializeIndexes();
  }

  // Verificar conexión
  private async testConnection(): Promise<boolean> {
    try {
      await this.meiliClient.health();

      this.logger.log("✅ Meilisearch conectado correctamente");

      return true;
    } catch (error) {
      this.logger.error("❌ Error conectando a Meilisearch:", error);

      return false;
    }
  }

  private async initializeIndexes() {
    await this.musicsIndexService.initialize();

    this.logger.log("✅ Índices de Meilisearch inicializados");
  }

  // Métodos de utilidad para búsqueda
  async search(indexName: string, query: string, options?: any) {
    const index = this.meiliClient.index(indexName);

    return await index.search(query, options);
  }

  // Añadir documentos a un índice
  async addDocuments(indexName: string, documents: any[]) {
    const index = this.meiliClient.index(indexName);

    return await index.addDocuments(documents);
  }

  // Actualizar documentos
  async updateDocuments(indexName: string, documents: any[]) {
    const index = this.meiliClient.index(indexName);

    return await index.updateDocuments(documents);
  }

  // Eliminar documento
  async deleteDocument(indexName: string, documentId: string) {
    const index = this.meiliClient.index(indexName);

    return await index.deleteDocument(documentId);
  }
}
