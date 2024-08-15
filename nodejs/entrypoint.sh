#!/bin/sh

# if [ "$BSB_CONTAINER" == "true" ]; then
#   cd /mnt/bsb-plugins
#   node /root/entrypoint.js
#   cd /home/bsb
#   # node ./node_modules/@bettercorp/service-base/postinstall.js --cwd=$(pwd)
# fi

mkdir /mnt/.temp

chown -R bsb:bsb /home/bsb
chown -R bsb:bsb /mnt/plugins

chmod -R 440 /home/bsb
chmod -R 640 /home/bsb/.temp
chmod -R 440 /mnt/plugins
chmod 400 /home/bsb/sec-config.yaml

# Check if the first argument is BSBDEBUG for debugging purposes
if [ "$1" = "BSBDEBUG" ]; then
  shift
  echo "WARNING: RUNNING IN DEBUG MODE"
  echo "IN THIS MODE, ANY COMMAND CAN BE RUN"
  echo "IT WILL BE RUN AS THE NODE USER"
  echo "DO NOT USE IN PRODUCTION"
  echo " - THERE WILL BE A 15s DELAY NOW"
  sleep 15s
  echo " - RUNNING YOUR COMMAND [$@]"
  exec gosu node:node "$@"
else
  exec gosu node:node node lib/cli.js
fi
