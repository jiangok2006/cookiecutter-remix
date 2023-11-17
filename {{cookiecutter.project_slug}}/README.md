# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`


### Wrangler and Drizzle
export DATABASE_NAME=test1
translate drizzle orm (*.ts) to sql (*.sql)
```
npx drizzle-kit generate:sqlite
```

show migrations not applied on local db
```
npx wrangler d1 migrations list $DATABASE_NAME --local
```

apply migrations (aka create tables) in local db
```
npx wrangler d1 migrations apply $DATABASE_NAME  --local
```

NOT NEED to do this to create tables
```
wrangler d1 execute $DATABASE_NAME --file=./migrations/0000_purple_leper_queen.sql --local
```

insert seed data in local db.
```
wrangler d1 execute $DATABASE_NAME  --file=./seed.sql --local 
```

run CF pages locally
```
npx wrangler pages dev --local --persist --d1=DB
```

drizzle studio (remote only). d1 already has console.
```
npx drizzle-kit studio
```

time-travel to a timestamp (remote only)
```
 npx wrangler d1 time-travel  restore test1 --timestamp 2023-11-14T10:43:31.000Z  
```

time-travel to an auto generated bookmark (remote only).
```
npx wrangler d1 time-travel  restore test1 --bookmark 0000000a-ffffffff-00004cdb-d8b886070a5354e08862b6b5e0c9587b
```

check log
```
 wrangler pages deployment tail 96ae708f-2ba3-4a73-a396-57bd274c41f9                                  
```