#!/usr/bin/env zx

// Script para borrar imágenes Docker que empiecen por "project/"
// y no coincidan con el tag latest

const project = "mcenter"

console.log(`🔍 Buscando imágenes ${project}/ para limpiar...`)

// Obtener todas las imágenes que empiecen por "project/" o contengan "/project/"
const images = await $`docker images --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep -E "(^${project}/|/${project}/)"`.quiet()

if (images.stdout.trim() === '') {
  console.log(`❌ No se encontraron imágenes que empiecen por '${project}/'`)
  process.exit(0)
}

console.log('📋 Imágenes encontradas:')
console.log(images.stdout)

// Parsear las imágenes
const imageLines = images.stdout.trim().split('\n')
const imageData = imageLines.map(line => {
  const [repo, tag, imageId] = line.split('\t')
  return { repo, tag, imageId }
})

// Crear set de IDs de imágenes latest
const latestImageIds = new Set()
imageData.forEach(({ repo, tag, imageId }) => {
  if (tag === 'latest') {
    latestImageIds.add(imageId)
  }
})

// Identificar imágenes a borrar
const imagesToDelete = []
imageData.forEach(({ repo, tag, imageId }) => {
  if (tag !== 'latest') {
    if (latestImageIds.has(imageId)) {
      console.log(`⚠️  Saltando ${repo}:${tag} (mismo ID que una imagen latest: ${imageId})`)
    } else {
      console.log(`🗑️  Marcando para borrar: ${repo}:${tag} (${imageId})`)
      imagesToDelete.push(`${repo}:${tag}`)
    }
  }
})

// Mostrar resumen
if (imagesToDelete.length === 0) {
  console.log('✅ No hay imágenes para borrar')
  process.exit(0)
}

console.log('\n🔥 Borrando imágenes...')

for (const img of imagesToDelete) {
  console.log(`Borrando: ${img}`)
  try {
    await $`docker rmi ${img}`.quiet()
    console.log(`✅ Borrado exitoso: ${img}`)
  } catch (error) {
    console.log(`❌ Error al borrar: ${img}`)
  }
}

console.log('\n🎉 Proceso completado')
