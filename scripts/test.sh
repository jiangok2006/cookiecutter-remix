#!/bin/bash

set -ex


DIR=$(pwd) 

export APP_HOST_PORT="127.0.0.1:8788"
export APP_HTTP_URL="http://${APP_HOST_PORT}"
export D1DATABASE="test1"

function setup_db {
    npx wrangler d1 migrations apply $D1DATABASE  --local
    npx wrangler d1 execute $D1DATABASE --file=./seed.sql --local
}

function start_http_server {
    npx pnpm run dev &
    $DIR/scripts/wait-for-it.sh "${APP_HOST_PORT}" -- echo '🟢 - http server is ready!'
}

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
# npx playwright install --with-deps
npx pnpm run build
setup_db
start_http_server
npx pnpm run test:$1

