#!/bin/bash
set -e

. "$(dirname -- "$0")/_/husky.sh"

fatal_error() {
  message=${1:-"Error fatal"}
  echo "ERROR: $message"
  exit 1
}

guard_current_branch() {
  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  local match='^((fix)|(feat)|(chore))(\((.+)\))?\/(.+)$'

  if ! (echo "$current_branch" | grep -Eq "$match"); then
    fatal_error "No se puede editar diréctamente la rama $current_branch."
  fi
}

guard_current_branch
