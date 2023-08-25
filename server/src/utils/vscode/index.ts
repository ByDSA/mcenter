export function isDebugging() {
  const envValue = process.env.VSCODE_INSPECTOR_OPTIONS;

  if (!envValue)
    return false;

  let json;

  try {
    json = JSON.parse(envValue);
  } catch (_) {
    return false;
  }

  if (!json)
    return false;

  if (json.attachMode !== "always")
    return true;

  return false;
}