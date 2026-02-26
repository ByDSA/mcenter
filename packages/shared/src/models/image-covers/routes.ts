import { GET_MANY_CRITERIA_PATH, GET_ONE_CRITERIA_PATH } from "../../routing/routes-utils";

const IMAGE_COVERS = "/api/image-covers";
const GET_ONE = GET_ONE_CRITERIA_PATH;
const GET_MANY = GET_MANY_CRITERIA_PATH;

export const imageCoversRoutes = {
  path: IMAGE_COVERS,
  withParams: (id: string) => `${IMAGE_COVERS}/${id}`,
  getOne: {
    path: `${IMAGE_COVERS}/${GET_ONE}`,
  },
  getMany: {
    path: `${IMAGE_COVERS}/${GET_MANY}`,
  },
  raw: {
    withParams: (filename: string) => {
      const [id] = filename.split(/\.|_/);
      const subfolder = id.slice(-2);

      return `/raw/image-covers/${subfolder}/${filename}`;
    },
  },
  upload: {
    path: `${IMAGE_COVERS}/image`,
  },
  admin: {
    path: `${IMAGE_COVERS}/admin`,
    rebuildAll: {
      path: `${IMAGE_COVERS}/admin/rebuild-all`,
    },
  },
};
