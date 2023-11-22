#!/bin/bash
set -e

. "$(dirname -- "$0")/_/husky.sh"

fatal_error() {
  message=${1:-"Error fatal"}
  echo "ERROR: $message"
  exit 1
}

main() {
  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  local match='^((fix)|(feat)|(chore))(\((.+)\))?\/(.+)$'

  if ! (echo "$current_branch" | grep -Eq "$match"); then
    fatal_error "No se puede editar diréctamente la rama $current_branch."
  fi
}

# check GITHOOKS_NO_CHECK_BRANCH value
. "$(dirname -- "$0")/../.env"

case "$GITHOOKS_NO_CHECK_BRANCH" in
0 | false | "")
  main "$@"
  ;;
1 | true)
  exit 0
  ;;
*)
  fatal_error "GITHOOKS_NO_CHECK_BRANCH tiene un valor no válido: $GITHOOKS_NO_CHECK_BRANCH"
  ;;
esac
