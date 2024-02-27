#!/bin/bash
cd /data/plugin-cockpit/plugin-myapps/build
yarn build
while [ ! -d "/usr/share/cockpit/myapps" ]; do
  sleep 1
done
cp -r ./* /usr/share/cockpit/myapps/