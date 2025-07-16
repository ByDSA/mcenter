#!/bin/bash
set -e

. "$(dirname -- "$0")/shared-imports.sh"

fatal_error() {
  message=${1:-"Error fatal"}
  echo "ERROR: $message"
  exit 1
}

main() {
  isPrBranch=$(is_pr_branch)

  if [ "$isPrBranch" = "0" ]; then
    fatal_error "No se puede editar diréctamente la rama actual."
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
