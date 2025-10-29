/** @type {import('next').NextConfig} */
const dev = {
  webpack: (config, { webpack } ) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.externals["node:fs"] = "commonjs node:fs";
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        },
      ),
    );

    addSvgr(config);

    return config;
  },
};

function addSvgr(config) {
  // Encuentra la regla existente que maneja archivos SVG
  const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));

  // Excluye todos los SVG de la regla original
  fileLoaderRule.exclude = /\.svg$/i;

  // Agrega nuevas reglas específicas
  config.module.rules.push(
    // SVG con ?raw → texto crudo
    {
      test: /\.svg$/i,
      resourceQuery: /raw/, // *.svg?raw
      type: "asset/source",
    },
    // SVG con ?url → url del archivo
    {
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
      type: "asset/resource",
    },
    // SVG normal → componente React
    {
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      resourceQuery: { not: [/raw/, /url/] },
      use: ["@svgr/webpack"],
    },
  );
}

const fs = require("node:fs");
const path = require("node:path");

function readMainPackageJson() {
  const packageJsonPath = locatePathPackageJson(path.join(__dirname, ".."));

  if (packageJsonPath === null)
    throw new Error("package.json not found");

  const packageJson = fs.readFileSync(packageJsonPath, "utf-8");
  const ret = JSON.parse(packageJson);

  return ret;
};

function locatePathPackageJson(initialDir = __dirname) {
  const { root } = path.parse(initialDir);
  const currentDir = initialDir;
  let dir = currentDir;

  while (dir !== root) {
    const packageJsonPath = path.join(dir, "package.json");

    if (fs.existsSync(packageJsonPath))
      return packageJsonPath;

    dir = path.parse(dir).dir;
  }

  return null;
}

module.exports = {
  ...dev,
  output: "standalone",
  reactStrictMode: true,
  env: {
    version: (() => {
      const { version } = readMainPackageJson();

      return version;
    } )(),
    BUILD_DATE: new Date(
      new Date().getTime() - (new Date().getTimezoneOffset() * 60000), // Tiempo local
    )
      .toISOString()
      .split("T")[0], // Formato YYYY-MM-DD
  },
};
