#!/bin/bash

set -ex

DIR=$(pwd) 

echo "deploy to supabase $1 ..."
echo "ls 2..."
ls $DIR
echo "ls 3..."
ls $DIR/cookiecutter-remix/prisma
npx prisma migrate deploy --schema=$DIR/cookiecutter-remix/prisma/schema.prisma