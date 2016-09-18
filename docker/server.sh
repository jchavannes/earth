#!/bin/bash

IMAGE_NAME="earth"
PORT="80"

INTERACTIVE=false

for i in "$@"
do
  case ${i} in
    -i)
    echo "== Interactive mode =="
    INTERACTIVE=true
    ;;
  esac
done

if ! type "docker" &>/dev/null; then
  echo "Docker must be installed."
  exit 1
fi

DIRECTORY=$(dirname $(dirname "`readlink -f "$0"`"))
echo "Using directory: ${DIRECTORY}"

CURRENT=`sudo docker ps | grep " ${IMAGE_NAME}:" | awk '{print $1}'`

if [ ! -z "${CURRENT}" ]; then
  echo "Stopping ${CURRENT}..."
  sudo docker stop ${CURRENT}
fi

echo "Building ${IMAGE_NAME}..."
sudo docker build -t ${IMAGE_NAME} ${DIRECTORY}/docker/

echo "Running ${IMAGE_NAME}..."
if ${INTERACTIVE}; then
    sudo docker run -v ${DIRECTORY}:/var/www -p ${PORT}:80 -i -t ${IMAGE_NAME} /bin/bash
else
  sudo docker run -v ${DIRECTORY}:/var/www -p ${PORT}:80 -d ${IMAGE_NAME}
fi

echo -e "\nServer built successfully at: http://localhost:${PORT}"
