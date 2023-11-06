set -x -e

cookiecutter gh:jiangok2006/cookiecutter-remix
cd cookiecutter-remix
npm install
npm run dev &
