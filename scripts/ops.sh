#!/bin/bash

ROOT="$HOME/repo/cookiecutter-remix"

alias prisma_migrate="npx prisma migrate"
alias prisma_seed="npx prisma db seed"
alias prisma_generate="npx prisma generate"
alias prisma_reset="npx prisma migrate reset"

function prepare_push {
    mv $ROOT/my $ROOT/{{cookiecutter.project_slug}}
}

function recreate_db {
    DATABASE_NAME=cookiecutter-remix-preview
    rm -rf migrations
    rm -rf .wrangler/state/v3/d1
    npx drizzle-kit generate:sqlite
    npx wrangler d1 migrations apply $DATABASE_NAME  --local
}

function watch_app {
    npx remix watch &
    npx wrangler pages dev ./public --d1=DB --live-reload
}