#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.docker"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.docker.example"

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
  fi
}

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"

  cookie_secret="$(generate_secret)"
  admin_password="$(generate_secret | cut -c1-24)"

  sed -i "s/^COOKIE_SECRET=.*/COOKIE_SECRET=$cookie_secret/" "$ENV_FILE"
  sed -i "s/^ADMIN_SEED_PASSWORD=.*/ADMIN_SEED_PASSWORD=$admin_password/" "$ENV_FILE"

  echo "Created $ENV_FILE with a generated cookie secret."
  echo "Generated admin username: admin"
  echo "Generated admin password: $admin_password"
fi

docker compose --env-file "$ENV_FILE" up -d --build
