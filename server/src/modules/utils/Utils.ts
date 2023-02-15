import { execPromisify } from "./process";

export type CompressParams = {
  folder: string;
  outFile: string;
};

export function compress( { folder, outFile }: CompressParams) {
  return execPromisify(`tar -czf ${outFile} -C ${folder} .`)
    .then(() => {
      //   console.log(`Compressed ${folder} to ${outFile}`);
    } )
    .catch(() => false);
}

export type PgDumpParams = {
  file: string;
  host: string;
  pass?: string;
  user: string;
  db: string;
};

export function pgDump( { host, pass, user, db, file }: PgDumpParams) {
  let cmd = "";

  if (pass)
    cmd += `PGPASSWORD=${pass} `;

  cmd += `pg_dump -h ${host} -U ${user} -v -Fc ${db} > ${file}`;

  return execPromisify(cmd);
}
