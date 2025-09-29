/* eslint-disable import/no-default-export */
import { defineConfig, devices } from "@playwright/test";

const projects = createSequentialPipe([
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "webkit",
    use: { ...devices["Desktop Safari"] },
  },
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
]);

export default defineConfig( {
  testDir: "./",
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: "html",
  globalSetup: "global-setup.ts", // Para que se ejecute en cada ejecución de sigle test en vscode
  projects,
} );

function createSequentialPipe(projects) {
  const result = [];
  let previousProjectName = null;

  projects.forEach((project, i) => {
    if (i > 0) {
    // Crear proyecto de setup para cada proyecto de tests
      const setupProjectName = `setup-${project.name}`;
      const setupProject = {
        name: setupProjectName,
        testMatch: /setup\.ts/,
        use: project.use || {}, // Usar la misma configuración del proyecto principal
        ...(previousProjectName && { dependencies: [previousProjectName] } ),
      };
      const testProject = {
        ...project,
        dependencies: [setupProjectName],
      };

      result.push(setupProject, testProject);
    } else
      result.push(project);

    // El siguiente setup dependerá del proyecto de tests actual
    previousProjectName = project.name;
  } );

  return result;
}
