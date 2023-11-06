set -x -e

pip install cookiecutter
cookiecutter --no-input gh:jiangok2006/cookiecutter-remix
cd cookiecutter_remix
echo "listing files..."
ls -al
npm install
npm run dev &
# npx playwright install --with-deps
npx playwright test
