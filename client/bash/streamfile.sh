#!/usr/bin/env bash

i=0
buffer=()
elemsstring=""

tail -n0 -F "$1" | while read LINE; do
  echo "$i"

  echo "$LINE"

  buffer[${#buffer[@]}]='{"source":"'"$2"'", "createdAt":"'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'", "payload":"'"$(echo $LINE | sed "s/\"/\\\\\"/g")"'"}'

  if [ "$i" == 100 ]
  then
    j=0
    for elem in "${buffer[@]}"
    do
	    if [ "$j" == 0 ]
	    then
        elemsstring="$elem"
      else
        elemsstring="$elemsstring,$elem"
      fi
      j=$((j+1))
    done

    curl \
      -X POST \
      "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \
      -d '{ "userId":   "'"$3"'",
            "serverId": "'"$4"'",
            "apiKeyId": "'"$5"'",
            "events":   ['"$elemsstring"']}'

      i=0
      buffer=()

  else
    i=$((i+1))
  fi
done
