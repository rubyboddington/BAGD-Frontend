#!/bin/bash

echo "This script will install the following npm package into your global package folder:"
echo ""
echo "postcss-simple-vars"
echo "postcss-nested"
echo "autoprefixer"
echo "http-server"
echo "postcss-cli"

TMOUT=10
echo ""
read -p "Please confirm you want to install these packages[Y/n]:"
echo ""

if [[ -z $REPLY ]]; then
    echo "Timeout, run 'npm install' again to install the global dependencies."
fi

if [[ $REPLY =~ ^[Yy]$ ]]; then
	echo "This is going to take awhile....."
	node globalDependencies.js
else
	echo "Global dependencies not installed, don't worry if you already have them."
fi
