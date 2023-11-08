#!/bin/bash

set -ex

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npm install
npx playwright install --with-deps

npm run dev &
npm run test:unit
npm run ui_test:e2e

