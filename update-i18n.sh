#!/bin/bash

source .env

function update() {
  language=$1

  url=$(curl -s -X POST https://api.poeditor.com/v2/projects/export \
    -d api_token="${POEDITOR_APITOKEN}" \
    -d id="${POEDITOR_PROJECT}" \
    -d language="${language}" \
    -d type="key_value_json" \
    -d filters="translated" | jq -rc '.result.url')

  echo "${language}=${url}"
  content=$(curl -s $url)

  if [ "$content" != "" ]; then
    echo "$content" > i18n/${language}.json
  else
    echo "{}" > i18n/${language}.json
  fi
}

for lang in $POEDITOR_LANGUAGES; do
  update $lang
done
