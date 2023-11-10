pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
npx playwright install --with-deps

echo "Running $1 tests"
npx pnpm run test:$1


