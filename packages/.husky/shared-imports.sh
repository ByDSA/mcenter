#!/usr/bin/env sh
set -e

is_pr_branch() {
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  match='^((fix)|(feat)|(chore))(\((.+)\))?\/(.+)$'

  if (echo "$current_branch" | grep -Eq "$match"); then
    echo "1"
  else
    echo "0"
  fi
}
