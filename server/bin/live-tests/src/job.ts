import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { sendMailAsync } from "./mails";
import { formatTemporal } from "./utils";

export default async function job() {
  const testsResults = await executeTests();

  if (!testsResults.stderr)
    return;

  try {
    await sendMailAsync( {
      subject: `${formatTemporal()}: Error al ejecutar los tests`,
      html: `<p>Error al ejecutar el comando de tests:</p><p>${testsResults.cmd}</p><br/><pre>${ ansiToHtml(testsResults.stderr) }</pre>`,
    } );
  } catch (e) {
    console.log(e);
  }
}

function getTestScript(): string {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const ret = packageJson.scripts.test;

  if (!ret)
    throw new Error("No test script found");

  return ret;
}

type ExecuteTestsRet = {
  cmd: string;
  stdout: string | undefined;
  stderr: string | undefined;
};
async function executeTests(): Promise<ExecuteTestsRet> {
  console.log(`Executing tests at ${ formatTemporal()}`);
  const testScript = getTestScript();
  const cmd = testScript.replace("jest", "node_modules/.bin/jest");
  const promiseResolved: {stdout: string; stderr: string} = await new Promise((resolve, _) => {
    exec(cmd, (error, out, err) => {
      resolve( {
        stdout: out,
        stderr: err,
      } );
    } );
  } );
  const {stdout, stderr} = promiseResolved;

  console.log(`Finish of executing tests at ${ formatTemporal()}`);

  return {
    cmd,
    stdout,
    stderr,
  };
}

const Convert = require("ansi-to-html");

function ansiToHtml(ansi: string): string {
  const convert = new Convert( {
    fg: "#000",
    bg: "#FFF",
    newline: true,
    escapeXML: true,
  } );

  return convert.toHtml(ansi);
}