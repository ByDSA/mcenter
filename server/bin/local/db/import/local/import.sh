#!/bin/bash
set -e

# Importar y validar variables de entorno
folder_name=$(basename $(dirname $(realpath "$0")))
set -a
. ../../../.env."$folder_name"
set +a

# this folder name

if [ -z "$DB_PASSWORD" ]; then
  echo "DB_PASSWORD is not set"
  exit 1
fi

DB_USERNAME=${DB_USERNAME:-root}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-27017}

echo "Importing database"
echo "AUTH:"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"

container_id=$(sudo docker ps | grep mongo | grep "$DB_PORT/tcp" | awk '{print $1}')
internal_cmd="mongorestore --host=$DB_HOST --port=$DB_PORT --username=$DB_USERNAME --password=$DB_PASSWORD --authenticationDatabase=admin --archive --drop"
sudo docker exec -i "$container_id" sh -c "$internal_cmd" <"$1"
