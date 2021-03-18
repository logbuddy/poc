#!/usr/bin/env bash

trap "kill 0" SIGINT

filePath="$1"
source="$2"
userId="$3"
serverId="$4"
apiKeyId="$5"
bufferSize="$6"
controlTimeout="$7"

controlFilePath="$(mktemp)"
controlFileEntry="--- ServerLogger.com streamfile.sh control file entry ---"

echo "Control file path: $controlFilePath"

while true; do
  sleep "$controlTimeout"
  echo "$controlFileEntry" >> "$controlFilePath"
done &

source="${source:0:256}"

i=0
eventsBuffer=()
eventsString=""


tail -n0 -F -q "$filePath" "$controlFilePath" | while read -r line; do
  line="${line:0:512}"
  if [ "$line" != "$controlFileEntry" ]
  then
    eventsBuffer[${#eventsBuffer[@]}]='{"source":"'"$source"'", "createdAt":"'"$(date +"%Y-%m-%dT%H:%M:%S%z")"'", "payload":"'"$(echo $line | sed "s/\"/\\\\\"/g")"'"}'
  fi

  if [ "$i" = "$bufferSize" ] || [ "$line" = "$controlFileEntry" ]
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

    if [ "$j" != 0 ]
    then
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
    fi

  else
    i=$((i+1))
  fi
done
