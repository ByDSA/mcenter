import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { fixtureImageCovers } from "#modules/image-covers/tests";

export const loadFixtureImageCoversInDisk = async () => {
  const docs: ImageCoverOdm.Doc[] = fixtureImageCovers.Disk.List
    .map(ImageCoverOdm.toFullDoc);

  await ImageCoverOdm.Model.insertMany(docs);
};
