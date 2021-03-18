#!/usr/bin/env bash

filepath="$1"
source="$2"
userId="$3"
serverId="$4"
apiKeyId="$5"
bufferSize="$6"

source="${source:0:256}"

i=0
eventsBuffer=()
eventsString=""

tail -n0 -F "$filepath" | while read -r line; do
  line="${line:0:512}"
  eventsBuffer[${#eventsBuffer[@]}]='{"source":"'"$source"'", "createdAt":"'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'", "payload":"'"$(echo $line | sed "s/\"/\\\\\"/g")"'"}'

  if [ "$i" == "$bufferSize" ]
  then
    j=0
    for eventString in "${eventsBuffer[@]}"
    do
	    if [ "$j" == 0 ]
	    then
        eventsString="$eventString"
      else
        eventsString="$eventsString,
$eventString"
      fi
      j=$((j+1))
    done

    date
    echo "$eventsString"
    curl \
      -X POST \
      "https://rs213s9yml.execute-api.eu-central-1.amazonaws.com/server-events" \
      -d '{ "userId":   "'"$userId"'",
            "serverId": "'"$serverId"'",
            "apiKeyId": "'"$apiKeyId"'",
            "events":   ['"$eventsString"']}'

      i=0
      eventsBuffer=()

  else
    i=$((i+1))
  fi
done
