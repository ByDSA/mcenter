export type ResourceObjType = {
  url: string;
  name?: string;
};

export type ResourceFileObjType = ResourceObjType & {
  hash: string;
  raw: string;
};
