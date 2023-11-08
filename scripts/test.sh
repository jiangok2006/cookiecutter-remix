#!/bin/bash

set -ex

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npm install
npx playwright install --with-deps

if [ "$1" == "unit" ] then
    npm run test:unit
elif [ "$1" == "integration" ] then
    npm run test:integration
else
    npm run dev &
    npm run test:e2e
endif

