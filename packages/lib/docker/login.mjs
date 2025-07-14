// @ts-check
import { $ } from "zx";

/**
 * @typedef {Object} Params
 * @property {string} dockerRegistryUrl
 * @property {string} [username]
 * @property {string} [password]
 * @param {Params} params
 */
export async function login(params) {
  const {
    dockerRegistryUrl,
    password: passwordArg,
    username: usernameArg,
  } = params;

  if (!dockerRegistryUrl)
    throw new Error("DOCKER_REGISTRY_URL is required");

  // Username
  let username = usernameArg;

  if (!username) {
    console.log("Username: ");
    username = process.stdin.read();
  }

  if (!username)
    throw new Error("Username is empty");

  // Password
  let password = passwordArg;

  if (!password) {
    console.log("Password: ");
    password = process.stdin.read();
  }

  if (!password)
    throw new Error("Password is empty");

  await $`echo "${password}" | sudo docker login ${dockerRegistryUrl} -u "${username}" --password-stdin`;
}

/**
 *
 * @param {string} url
 */
export async function isLoggedTo(url) {
  if (!url)
    throw new Error("URL is required");

  const jsonFile = process.env.HOME + "/.docker/config.json";
  const cmd = [
    "sudo",
    "jq",
    "-e",
    "--arg",
    "key",
    url,
    ".auths | has($key)",
    jsonFile,
  ];
  const ret = (await $`${cmd}`).stdout.trim();

  if (ret === "true")
    return true;
  else if (ret === "false")
    return false;
  else
    throw new Error("Unexpected output: " + ret);
}

/**
 *
 * @param {Params} params
 */
export async function loginIfNot(params) {
  const { dockerRegistryUrl } = params;

  if (!dockerRegistryUrl)
    throw new Error("DOCKER_REGISTRY_URL is required");

  const logged = await isLoggedTo(dockerRegistryUrl);

  if (!logged)
    await login(params);
}
