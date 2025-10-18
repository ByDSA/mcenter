#!/bin/sh

# Determina la arquitectura más concreta para builds de Docker
get_platform() {
    os=$(uname -s | tr '[:upper:]' '[:lower:]')
    arch=$(uname -m)

    # Normaliza la arquitectura
    case "$arch" in
        x86_64)
            arch="amd64"
            ;;
        aarch64|arm64)
            arch="arm64"
            ;;
        armv7l)
            arch="armv7"
            ;;
    esac

    echo "${os}-${arch}"
}

# Obtiene la versión desde package.json
get_version_from_package() {
    package_json_path="$1"
    version=$(cat "$package_json_path" 2>/dev/null | \
        grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | \
        head -n1 | \
        sed 's/.*"\([^"]*\)".*/\1/')
    echo "$version"
}

# Busca el artifact local más reciente
find_latest_local_artifact() {
    search_dir="$1"
    name_pattern="$2"
    platform="$3"

    artifact=$(find "$search_dir" -maxdepth 1 \
        -name "${name_pattern}-*-${platform}.tar.gz" \
        -type f -printf '%T@ %p\n' 2>/dev/null | \
        sort -rn | head -n1 | cut -d' ' -f2-)

    echo "$artifact"
}

# Construye el nombre del artifact
build_artifact_name() {
    name="$1"
    version="$2"
    platform="$3"

    echo "${name}-${version}-${platform}.tar.gz"
}

# Verifica si existe un artifact específico
artifact_exists() {
    artifact_path="$1"
    [ -f "$artifact_path" ] && return 0 || return 1
}

# Comprueba si se usará un artifact existente (sin ejecutar nada)
# Retorna 0 si se usará artifact, 1 si se necesita build
will_use_artifact() {
    project_name="$1"
    version="$2"
    platform="$3"
    artifacts_dir="$4"

    # Si no hay versión, busca artifact local más reciente
    if [ -z "$version" ]; then
        artifact_path=$(find_latest_local_artifact "$artifacts_dir" "$project_name" "$platform")
        if [ -n "$artifact_path" ] && [ -f "$artifact_path" ]; then
            return 0
        else
            return 1
        fi
    fi

    # Construye el nombre del artifact
    artifact_name=$(build_artifact_name "$project_name" "$version" "$platform")
    artifact_path="$artifacts_dir/$artifact_name"

    # Si el artifact existe, se usará
    if artifact_exists "$artifact_path"; then
        return 0
    fi

    return 1
}

# Flujo principal de manejo de artifacts
# Requiere que el script específico defina:
#   - decompress_artifact()
#   - compress_artifact()
#   - build_artifact()
run_artifact_workflow() {
    project_name="$1"
    version="$2"
    platform="$3"
    artifacts_dir="$4"

    echo "Platform: $platform"
    echo "Última versión: $version"

    # Manejo de versión
    if [ -n "$version" ]; then
        echo "Versión obtenida: $version"
    else
        echo "No se pudo obtener la versión."
    fi

    # Si no hay versión, busca artifact local más reciente
    if [ -z "$version" ]; then
        echo "Buscando artifact local más reciente..."
        artifact_path=$(find_latest_local_artifact "$artifacts_dir" "$project_name" "$platform")

        if [ -n "$artifact_path" ] && [ -f "$artifact_path" ]; then
            echo "Usando artifact: $(basename "$artifact_path")"
            decompress_artifact "$artifact_path"
            echo "Fin!"
            exit 0
        else
            echo "No se encontró artifact local. Abortando."
            exit 1
        fi
    fi

    # Construye el nombre del artifact
    artifact_name=$(build_artifact_name "$project_name" "$version" "$platform")
    artifact_path="$artifacts_dir/$artifact_name"

    # Si el artifact existe, úsalo
    if artifact_exists "$artifact_path"; then
        echo "Artifact encontrado: $artifact_name"
        echo "Usando artifact: $(basename "$artifact_path")"
        decompress_artifact "$artifact_path"
        echo "Fin!"
        exit 0
    fi

    # Si no existe, crea uno nuevo
    echo "No se encontró artifact. Ejecutando build..."
    build_artifact

    echo "Creando artifact..."
    compress_artifact "$artifact_path"
    echo "Artifact guardado como: $artifact_name"

    echo "Fin!"
}