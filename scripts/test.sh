#!/bin/bash

set -ex

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npm install
npx playwright install --with-deps

if [ "$1" == "unit" ]; then
    echo "Running unit tests"
    npm run test:unit
elif [ "$1" == "integration" ]; then
    echo "Running integration tests"
    npm run test:integration
else
    echo "Running e2e tests"
    npm run dev &
    npm run test:e2e
fi

