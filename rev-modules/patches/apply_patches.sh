#!/bin/sh -e

patchDir="../rev-modules/patches/"
patchList=$patchDir"patch_list.txt"

cd ../../linux

pwd

while read -r line
do
    name=$line
    git am $patchDir$name
done < $patchList

