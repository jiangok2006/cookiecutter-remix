#!/bin/bash

set -ex

DIR=$(pwd) 

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install

npx prisma migrate deploy