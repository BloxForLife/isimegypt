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

npx staticrypt *.html -d dist --short --remember 30 \
  --template-title "Website locked" \
  --template-instructions "Payment for this website is still pending. Enter the password to continue." \
  --template-button "Continue" \
  --template-placeholder "Password" \
  --template-remember "Remember me for 30 days" \
  --template-error "Wrong password" \
  --template-color-primary "#C7A15A" \
  --template-color-secondary "#120D08"
