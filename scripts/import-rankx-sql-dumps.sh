#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SOURCE_DIR="${1:-$REPO_ROOT/sql-dumps/local}"
ENV_FILE="$REPO_ROOT/.env"
ENV_EXAMPLE_FILE="$REPO_ROOT/.env.docker.example"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  MYSQL_ROOT_PASSWORD=$(grep '^MYSQL_ROOT_PASSWORD=' "$ENV_FILE" | head -n 1 | cut -d= -f2-)
else
  MYSQL_ROOT_PASSWORD=$(grep '^MYSQL_ROOT_PASSWORD=' "$ENV_EXAMPLE_FILE" | head -n 1 | cut -d= -f2-)
fi

if [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
  echo "MYSQL_ROOT_PASSWORD was not found in .env or .env.docker.example" >&2
  exit 1
fi

MYSQL_CONTAINER=$(cd "$REPO_ROOT" && docker compose ps -q mysql)
if [ -z "$MYSQL_CONTAINER" ]; then
  echo "MySQL container is not running. Start the stack with 'docker compose up -d' first." >&2
  exit 1
fi

find "$SOURCE_DIR" -maxdepth 1 -type f -name '*.sql' | sort | while IFS= read -r file; do
  name=$(basename "$file")
  echo "Importing $name from $SOURCE_DIR"
  docker cp "$file" "$MYSQL_CONTAINER:/tmp/$name"
  (cd "$REPO_ROOT" && docker compose exec -T mysql sh -lc "MYSQL_PWD='$MYSQL_ROOT_PASSWORD' mysql -uroot < /tmp/$name")
  (cd "$REPO_ROOT" && docker compose exec -T mysql rm -f "/tmp/$name") >/dev/null
done

echo "SQL import completed successfully."
