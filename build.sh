#!/bin/bash
yarn build
rm -rf /usr/share/cockpit/myapps/*
cp -r /data/plugin-cockpit/plugin-myapps/build/* /usr/share/cockpit/myapps/