#!/bin/bash

echo "This script will install the following npm package into your global package folder:"
echo ""
echo "postcss-simple-vars"
echo "postcss-nested"
echo "autoprefixer"

TMOUT=10
echo ""
read -p "Please confirm you want to install these packages[Y/n]:"
echo ""

if [[ -z $REPLY ]]; then
    echo "Timeout, run 'npm install' again to install the global dependencies."
fi

if [[ $REPLY =~ ^[Yy]$ ]]; then
	npm install -g postcss-simple-vars postcss-nested autoprefixer
else
	echo "Global dependencies not installed, don't worry if you already have them."
fi
