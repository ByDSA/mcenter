import type { PipelineStage } from "mongoose";
import { COLLECTION } from "./odm";

type Props = {
  imageCoverIdField?: string;
  imageCoverField?: string;
};

/**
 * Agrega el objeto ImageCover poblado a partir de un ID.
 * Útil para enrichSingleMusic y para generación de pipelines de criteria.
 * @param localIdPath Path al campo que tiene el ID (ej: "imageCoverId" o "music.imageCoverId")
 * @param targetPath Path donde se guardará el objeto (ej: "imageCover" o "music.imageCover")
 */
export function enrichImageCover(
  props?: Props,
): PipelineStage[] {
  const imageCoverIdField = props?.imageCoverIdField ?? "imageCoverId";
  const imageCoverField = props?.imageCoverField ?? "imageCover";
  // Usamos un nombre de variable temporal muy específico para evitar colisiones
  const tempField = `temp_enrich_img_${imageCoverIdField.replace(/\./g, "_")}`;

  return [
    {
      $lookup: {
        from: COLLECTION,
        localField: imageCoverIdField,
        foreignField: "_id",
        as: tempField,
      },
    },
    {
      $unwind: {
        path: `$${tempField}`,
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        [imageCoverField]: `$${tempField}`,
      },
    },
    {
      $unset: tempField,
    },
  ];
}
