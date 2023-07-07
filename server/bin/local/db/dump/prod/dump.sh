#!/bin/bash
set -e

# Importar y validar variables de entorno
folder_name=$(basename $(dirname $(realpath "$0")))
set -a
. ../../../.env."$folder_name"
set +a

# this folder name

if [ -z "$MONGODB_URI" ]; then
  echo "MONGODB_URI is not set"
  exit 1
fi

echo "Dumping database"

# Dumping database
timestamp=$(date +"%Y%m%d%H%M%S")
mongodump --uri "$MONGODB_URI" --archive >"./dump-$timestamp.db"
