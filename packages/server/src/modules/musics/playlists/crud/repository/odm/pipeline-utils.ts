import { PipelineStage } from "mongoose";

export function enrichOwnerUserPublic( { localField,
  targetField }: {
  localField: string;
  targetField: string;
} ): PipelineStage[] {
  return [
    {
      $lookup: {
        from: "users",
        let: {
          userId: `$${localField}`,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$userId"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              publicName: 1,
              publicUsername: 1,
            },
          },
        ],
        as: targetField,
      },
    },
    {
      $unwind: {
        path: `$${targetField}`,
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
}
