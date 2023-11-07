set -x -e

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npm install
npm run dev &
npx playwright install --with-deps
npx playwright test
