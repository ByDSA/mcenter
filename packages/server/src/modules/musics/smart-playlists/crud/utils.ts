export function makeExpicitUserQuery(query: string, userSlug: string) {
  return query.replaceAll("tag:", "tag:@" + userSlug + "/");
}
