import { ExecException, exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { sendMailAsync } from "./mails";
import { formatTemporal } from "./utils";

export default async function job() {
  const testsResults = await executeTests();

  if (!testsResults.error)
    return;

  try {
    await sendMailAsync( {
      subject: `${formatTemporal()}: Error al ejecutar los tests`,
      html: genHtml(testsResults),
    } );
  } catch (e) {
    console.log(e);
  }
}

// eslint-disable-next-line no-use-before-define
function genHtml(testsResults: ExecuteTestsRet) {
  const stderrHtml: string | null = testsResults.stderr
    ? `<p>stderr:</p>
  <pre>
  ${ ansiToHtml(testsResults.stderr) }
  </pre>
  <br/>`
    : null;
  const stdoutHtml: string | null = testsResults.stdout
    ? `<p>stdout:</p>
  <pre>
  ${ ansiToHtml(testsResults.stdout) }
  </pre>
  <br/>`
    : null;

  return `<p>Error al ejecutar el comando de tests:</p>
      <p>CMD: <pre>${testsResults.cmd}</pre></p>
      <br/>
      ${stdoutHtml}${stderrHtml}`;
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
  error: ExecException | null;
  stdout: string | undefined;
  stderr: string | undefined;
};
async function executeTests(): Promise<ExecuteTestsRet> {
  console.log(`Executing tests at ${ formatTemporal()}`);
  const testScript = getTestScript();
  const cmd = testScript.replace("jest", "node_modules/.bin/jest");
  const promiseResolved: Omit<ExecuteTestsRet,"cmd"> = await new Promise((resolve, _) => {
    exec(cmd, (error, out, err) => {
      resolve( {
        error,
        stdout: out,
        stderr: err,
      } );
    } );
  } );
  const {stdout, stderr, error} = promiseResolved;

  console.log(`Finish of executing tests at ${ formatTemporal()}`);

  return {
    error,
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