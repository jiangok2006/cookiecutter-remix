#!/bin/bash

set -ex


DIR=$(pwd) 

export APP_HTTP_URL="http://localhost:8788"
export D1DATABASE="test1"

function setup_db {
    npx wrangler d1 migrations apply $D1DATABASE  --local
    npx wrangler d1 execute $D1DATABASE --file=./seed.sql --local
}

function start_http_server {
    npx pnpm run dev &
    $DIR/scripts/wait-for-it.sh "${APP_HTTP_URL}" -- echo '🟢 - http server is ready!'
}

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
npx playwright install --with-deps

setup_db
start_http_server

echo "Running $1 tests"
npx pnpm run test:$1

