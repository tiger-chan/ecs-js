#!/usr/bin/env bash

find test -name '*.test.js' -print0 | while read -d $'\0' file
do
	DIR=$(dirname ${file#test/})
	NAME=$(basename ${file%.test.js})
	echo "Starting tests:$DIR/$NAME"
	npx ava --tap $file | \
	npx tap-junit -p \
		-s $DIR/$NAME \
		-c $DIR/$NAME \
		-o output/$DIR \
		-n $NAME.xml
done
