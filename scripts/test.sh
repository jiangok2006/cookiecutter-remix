#!/bin/bash

set -ex

DIR=$(pwd) 

ls

export POSTGRES_HOST="localhost"
export POSTGRES_DB="postgres"
export POSTGRES_PORT="54323"
export POSTGRES_PASSWORD="postgres"
export DATABASE_URL="postgres://postgres:postgres@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"


function start_db {
    docker-compose up -d
    echo '🟡 - Waiting for database to be ready...'
    $DIR/cookiecutter_remix/scripts/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'
    npx prisma migrate dev --name init
}

function start_http_server {
    npx pnpm run dev &
}

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
npx playwright install --with-deps

start_db
start_http_server

if [ "$1" == "unit" ]; then
    echo "Running unit tests"
    npx pnpm run test:unit
elif [ "$1" == "integration" ]; then
    echo "Running integration tests"
    npx pnpm run test:integration
else
    echo "Running e2e tests"
    npx pnpm run test:e2e
fi

