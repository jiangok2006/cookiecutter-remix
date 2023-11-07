set -x -e

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npm install
npx playwright install --with-deps

npm run dev &
npx playwright test
