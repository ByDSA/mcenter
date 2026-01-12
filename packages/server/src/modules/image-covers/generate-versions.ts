import * as path from "path";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const LARGE_SIZE = 600;
const MEDIUM_SIZE = 300;
const SMALL_SIZE = 60;

interface ImageVersionsProps {
  filePath: string;
}

interface ImageVersionsResult {
  original: string;
  large?: string;
  medium?: string;
  small?: string;
}

export async function generateImageVersions(
  { filePath }: ImageVersionsProps,
): Promise<ImageVersionsResult> {
  const ext = path.extname(filePath);
  const fullBaseName = path.join(path.dirname(filePath), path.basename(filePath, ext));
  const originalBaseName = path.basename(filePath, ext);

  // Eliminar versiones previas si existen
  fs.readdirSync(path.dirname(filePath))
    .forEach((file) => {
      const fileBaseName = path.basename(file);

      if (fileBaseName.startsWith(originalBaseName + "_"))
        fs.unlinkSync(path.join(path.dirname(filePath), file));
    } );

  // 1. Obtener dimensiones y recortar a cuadrado si es necesario
  await cropToSquare(filePath);

  const result: ImageVersionsResult = {
    original: path.basename(filePath),
  };
  // 2. Obtener nuevas dimensiones (post-recorte) para verificar si redimensionar
  const metadata = await getMetadata(filePath);
  const size = metadata.width || 0;

  // Generar versión LARGE
  if (size > LARGE_SIZE) {
    const largeFullPath = `${fullBaseName}_large${ext}`;

    await resizeImage(filePath, largeFullPath, LARGE_SIZE);
    result.large = path.basename(largeFullPath);
  }

  // Generar versión MEDIUM
  if (size > MEDIUM_SIZE) {
    const mediumFullPath = `${fullBaseName}_medium${ext}`;

    await resizeImage(filePath, mediumFullPath, MEDIUM_SIZE);
    result.medium = path.basename(mediumFullPath);
  }

  // Generar versión SMALL
  if (size > SMALL_SIZE) {
    const smallFullPath = `${fullBaseName}_small${ext}`;

    await resizeImage(filePath, smallFullPath, SMALL_SIZE);
    result.small = path.basename(smallFullPath);
  }

  return result;
}

// --- Helpers con Promesas ---
function getMetadata(filePath: string): Promise<ffmpeg.FfprobeData["streams"][0]> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err)
        reject(err);
      else
        resolve(data.streams[0]);
    } );
  } );
}

async function cropToSquare(filePath: string): Promise<void> {
  const meta = await getMetadata(filePath);
  const width = meta.width || 0;
  const height = meta.height || 0;

  if (width === height)
    return;

  const minSide = Math.min(width, height);
  const tempPath = `${filePath}.tmp${path.extname(filePath)}`;

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      // crop(width, height, x, y) - Centrado automáticamente
      .videoFilters([
        {
          filter: "crop",
          options: {
            w: minSide,
            h: minSide,
          },
        },
      ])
      .on("end", () => {
        fs.renameSync(tempPath, filePath); // Reemplazar original
        resolve();
      } )
      .on("error", reject)
      .save(tempPath);
  } );
}

function resizeImage(input: string, output: string, size: number): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .size(`${size}x${size}`)
      .on("end", () => resolve())
      .on("error", reject)
      .save(output);
  } );
}
