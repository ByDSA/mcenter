import fs from "fs";

export type DynamicLoadProps = {
  file: string;
  sample?: string;
  args?: any[];
}

export async function dynamicExecScript(
  { file, args = [], sample }: DynamicLoadProps,
): Promise<any> {
  const s = await dynamicLoadScript( {
    file,
    sample,
  } );

  if (s)
    return s(...args);

  return undefined;
}

export function dynamicLoadScript(
  { file, sample }: DynamicLoadProps,
): Promise<((...a: any[])=> any)> {
  try {
    return innerLoad(file);
  } catch (e) {
    console.log(e);

    if (sample) {
      fs.writeFile(file, sample, (err) => {
        if (err)
          throw err;
      } );
    }

    removeFileFromCache(file);

    return innerLoad(file);
  }
}

async function innerLoad(file: string) {
  const { default: s } = await import(file);
  const ret = s;

  removeFileFromCache(file);

  return ret;
}

export function dynamicLoadScriptFromEnvVar(
  envVar: string,
): Promise<((...a: any[])=> any)> {
  const envVarContent = process.env[envVar];

  if (!envVarContent)
    throw new Error(`No ${envVar} env found`);

  return dynamicLoadScript( {
    file: envVarContent,
  } );
}

function removeFileFromCache(file: string) {
  delete require.cache[require.resolve(file)];
}
