import Model from "./model";

// eslint-disable-next-line import/prefer-default-export
export function deleteAll() {
  return Model.deleteMany( {
  } );
}
