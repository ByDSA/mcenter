import { isDebugging } from "./src/utils/vscode";

if (!isDebugging()) {
  global.console.log = jest.fn(); // Mockear console.log
  global.console.error = jest.fn(); // Mockear console.error
  global.console.warn = jest.fn(); // Mockear console.warn
}
