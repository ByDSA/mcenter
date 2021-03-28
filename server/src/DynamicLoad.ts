import fs from "fs";

export type DynamicLoadProps = {
  file: string;
  sample?: string;
  args?: any[];
}

export async function dynamicLoad({ file, args = [], sample }: DynamicLoadProps) {
  try {
    const { default: s } = await import(file);
    const ret = s(...args);
    delete require.cache[require.resolve(file)];
    return ret;
  } catch (e) {
    console.log(e);
    console.log(`File not found or invalid: ${file}`);
    if (sample)
      fs.writeFile(file, sample, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
  }
}