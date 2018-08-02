#!/bin/bash

# exit if error
set -o errexit

# define a few variables
node_output_name="City.Hub-$os_platform-$arch"
app_output_name="City.Hub-$TRAVIS_OS_NAME-$arch"
app_output_zip_name="City.Hub-$TRAVIS_OS_NAME-$arch.zip"

if [ "$TRAVIS_OS_NAME" = "osx" ]
then
  dotnet_resources_path_in_app=$TRAVIS_BUILD_DIR/cityhub_out/$app_output_name/CityHub.app/contents/resources/app/assets/daemon
else
  dotnet_resources_path_in_app=$TRAVIS_BUILD_DIR/cityhub_out/$app_output_name/resources/app/assets/daemon
fi

echo "current environment variables:"
echo "OS name:" $TRAVIS_OS_NAME
echo "Platform:" $os_platform
echo "Build directory:" $TRAVIS_BUILD_DIR
echo "Node version:" $TRAVIS_NODE_VERSION
echo "Architecture:" $arch
echo "Configuration:" $configuration
echo "Node.js output name:" $node_output_name
echo "App output folder name:" $app_output_name
echo "App output zip file name:" $app_output_zip_name
echo "dotnet resources path in app:" $dotnet_resources_path_in_app
echo "Branch:" $TRAVIS_BRANCH
echo "Tag:" $TRAVIS_TAG
echo "Commit:" $TRAVIS_COMMIT
echo "Commit message:" $TRAVIS_COMMIT_MESSAGE


dotnet --info

# Initialize dependencies
echo $log_prefix STARTED restoring dotnet and npm packages
cd $TRAVIS_BUILD_DIR
git submodule update --init --recursive

cd $TRAVIS_BUILD_DIR

npm install
npm install -g npx
echo $log_prefix FINISHED restoring dotnet and npm packages

# dotnet publish
echo $log_prefix running 'dotnet publish'
cd $TRAVIS_BUILD_DIR/city-chain/src/City.Chain
dotnet publish -c $configuration -r $TRAVIS_OS_NAME-$arch -v m -o $TRAVIS_BUILD_DIR/daemon

echo $log_prefix chmoding the City.Hub.Daemon file
chmod +x $TRAVIS_BUILD_DIR/daemon/City.Hub.Daemon

# node Build
cd $TRAVIS_BUILD_DIR
echo $log_prefix running 'npm run'
npm run build:prod

# node packaging
echo $log_prefix packaging City Hub 
if [ "$TRAVIS_OS_NAME" = "osx" ]
then
  npx electron-builder build --mac --$arch
else
  npx electron-builder build --linux --$arch
fi

echo $log_prefix finished packaging

#tests
echo $log_prefix no tests to run

echo $log_prefix contents of TRAVIS_BUILD_DIR
cd $TRAVIS_BUILD_DIR
ls

echo $log_prefix contents of the app-builds folder
cd $TRAVIS_BUILD_DIR/build/
# replace the spaces in the name with a dot as CI system have trouble handling spaces in names.
for file in *.{dmg,tar.gz,deb}; do mv "$file" `echo $file | tr ' ' '.'` 2>/dev/null || : ; done

ls

echo $log_prefix FINISHED build

