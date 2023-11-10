#!/bin/bash

set -ex

DIR=$(pwd) 

export POSTGRES_HOST="localhost"
export POSTGRES_DB="postgres"
export POSTGRES_PORT="54323"
export POSTGRES_PASSWORD="postgres"
export DATABASE_URL="postgres://postgres:postgres@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
export APP_HTTP_URL="http://localhost:3000"

function start_db {
    docker-compose up -d
    echo '🟡 - Waiting for database to be ready...'
    $DIR/scripts/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'
    npx prisma migrate dev --name init
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

start_db
start_http_server

echo "Running $1 tests"
npx pnpm run test:$1

