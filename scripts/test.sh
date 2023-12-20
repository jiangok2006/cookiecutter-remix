#!/bin/bash

set -ex


DIR=$(pwd) 

export APP_HOST_PORT="127.0.0.1:8788"
export APP_HTTP_URL="http://${APP_HOST_PORT}"
export D1DATABASE="test1"

function setup_db {
    npx wrangler d1 migrations apply $D1DATABASE -e staging --local
    npx wrangler d1 execute $D1DATABASE --file=./seed.sql -e staging --local
}

function start_http_server {
    npx pnpm run dev &
    $DIR/scripts/wait-for-it.sh "${APP_HOST_PORT}" -- echo '🟢 - http server is ready!'
}

cd my
npx pnpm install
npx pnpm exec playwright install-deps
npx playwright install
npx pnpm run build
setup_db
start_http_server
npx pnpm run test:$1

