#!/bin/sh
# Builds the deployable site into dist/ with every page encrypted by
# StatiCrypt. The password comes from the STATICRYPT_PASSWORD environment
# variable (set it in Vercel's project settings), never from this repo.
set -e

if [ -z "$STATICRYPT_PASSWORD" ]; then
  echo "STATICRYPT_PASSWORD is not set; refusing to publish the site unlocked." >&2
  exit 1
fi

rm -rf dist
mkdir -p dist
cp -r gallery isim.png a320.png styles.css script.js dist/

npx staticrypt *.html -d dist --short --remember false \
  -t lock-template.html \
  --template-title "Website locked" \
  --template-instructions "This website has been abandoned because the developer and the client did not reach an agreement. It is now locked to prevent it being marketed without the developer's permission." \
  --template-button "Continue / متابعة" \
  --template-placeholder "Password / كلمة المرور" \
  --template-error "Wrong password / كلمة مرور خاطئة" \
  --template-color-primary "#C7A15A" \
  --template-color-secondary "#120D08"
