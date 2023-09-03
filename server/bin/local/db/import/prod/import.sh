#!/bin/bash
set -e

# get this folder path
this_folder=$(dirname $(realpath "$0"))

dump_tmp="$this_folder/dump.db"
"$this_folder"/../../dump/prod/dump.sh "$dump_tmp"
"$this_folder"/../../import/local/import.sh "$dump_tmp"

rm "$dump_tmp"
