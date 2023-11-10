#!/bin/bash

set -ex

DIR=$(pwd) 

echo "deploy to supabase $1 ..."

npx prisma migrate deploy --schema=$DIR/cookiecutter-remix/prisma/schema.prisma