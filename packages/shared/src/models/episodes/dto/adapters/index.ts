import { Episode } from "../../Entity";

export function episodeDtoToModel(dto: Episode): Episode {
  return {
    ...dto,
    fileInfo: dto.fileInfo,
    timestamps: {
      createdAt: new Date(dto.timestamps.createdAt),
      updatedAt: new Date(dto.timestamps.updatedAt),
      addedAt: new Date(dto.timestamps.addedAt),
    },
  };
}
