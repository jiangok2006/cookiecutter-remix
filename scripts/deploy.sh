#!/bin/bash

set -ex

DIR=$(pwd) 

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
npx pnpm run build

npx pnpm run pages:deploy --project-name cookiecutter-remix $1
