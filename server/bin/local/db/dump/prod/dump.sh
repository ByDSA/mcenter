#!/bin/bash
set -e

# check if mongodump is installed. otherwise, install
if ! command -v mongodump &>/dev/null; then
  echo "mongodump is not installed. Installing..."

  # Import the public key used by the package management system.
  wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

  # Create a list file for MongoDB.
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

  # Reload local package database.
  sudo apt-get update

  # Install the MongoDB packages.
  sudo apt install -y mongodb-org-tools

  if ! command -v mongodump &>/dev/null; then
    echo "mongodump is not installed. Aborting..."
    exit 1
  fi
fi

# Importar y validar variables de entorno
folder_name=$(basename $(dirname $(realpath "$0")))
this_folder=$(dirname $(realpath "$0"))
set -a
. "$this_folder"/../../../.env."$folder_name"
set +a

# this folder name

if [ -z "$MONGODB_URI" ]; then
  echo "MONGODB_URI is not set"
  exit 1
fi

echo "Dumping database"

# Dumping database
timestamp=$(date +"%Y%m%d%H%M%S")
out_file=${1:-$this_folder/dump-$timestamp.db}
mongodump --uri "$MONGODB_URI" --archive >"$out_file"
