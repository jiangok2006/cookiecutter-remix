#!/bin/bash

set -ex

DIR=$(pwd) 

cd my
npx pnpm install
npx pnpm run build

npx pnpm run pages:deploy --project-name cookiecutter-remix $1
