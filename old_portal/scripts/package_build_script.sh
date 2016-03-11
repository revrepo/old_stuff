#!/bin/bash

#
# This script builds Rev portal Debian package
#

if [ -z "$WORKSPACE" ]; then
	echo "ERROR: WORKSPACE env. variable is not set"
	exit 1
fi

if [ -z "$BUILD_NUMBER" ]; then
	echo "ERROR: BUILD_NUMBER env. variable is not set"
	exit 1
fi

VERSION=4.0.$BUILD_NUMBER

echo $VERSION > $WORKSPACE/version.txt

PACKAGEDIR=packages

if [ ! -d $PACKAGEDIR ]; then
        echo "INFO: Directory $PACKAGEDIR does not exist - creating it..."
        mkdir $PACKAGEDIR
        if [ $? -ne 0 ]; then
                echo "ERROR: Failed to create directory $PACKAGEDIR - aborting"
                exit 1
        fi
fi

PACKAGENAME=revsw-portal

WORKDIR="package_build_dir"
sudo rm -rf $WORKDIR

mkdir $WORKDIR
cd $WORKDIR

if [ $? -ne 0 ]; then
  echo "FATAL: Failed to CD to directory $WORKDIR"
  exit 1
fi


foldername=$PACKAGENAME'_'$VERSION
mkdir -p $foldername/DEBIAN
touch $foldername/DEBIAN/control

PackageName=$PACKAGENAME
PackageVersion=$VERSION
MaintainerName="Victor Gartvich"
MaintainerEmail=victor@revsw.com

echo "Package: $PackageName
Version: $PackageVersion
Architecture: amd64
Maintainer: $MaintainerName <$MaintainerEmail>
Installed-Size: 26
Depends: apache2
Recommends: apache2
Section: unknown
Priority: extra
Homepage: www.revsw.com
Description: Rev Customer Portal Server Side Application" >> $foldername/DEBIAN/control

mkdir -p $foldername/etc/init.d  $foldername/etc/logrotate.d

cp -rp $WORKSPACE/scripts/init.d_revsw-portal  $foldername/etc/init.d/revsw-portal 

cp -rp $WORKSPACE/scripts/logrotate_revsw-portal $foldername/etc/logrotate.d/revsw-portal

mkdir -p $foldername/opt/$PackageName $foldername/opt/$PackageName/log/ $foldername/opt/$PackageName/bin/

for DIR in www version.txt package.json server.js app config node_modules config docs db json; do
  cp -rf  $WORKSPACE/$DIR  $foldername/opt/$PackageName/
done



# sed -i 's/"package_no":"3.1"/"package_no":"'$VERSION'"/g' $foldername/opt/$PackageName/www/$PackageName/version.js

sudo chown -R root:root $foldername/opt
sudo chown -R root:root $foldername/etc

dpkg -b $foldername $WORKSPACE/$PACKAGEDIR/$foldername.deb

 
