set -x -e

pip install cookiecutter
cookiecutter --no-input cookiecutter-remix-code
cd cookiecutter_remix
echo "listing files..."
ls -al
npm install
npm run dev &
# npx playwright install --with-deps
npx playwright test
