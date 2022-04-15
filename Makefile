IMAGE=docker.io/r06m00r3/ts3-disco-bot
TAG=local
include .env

build:
	docker build -t ${IMAGE}:${TAG} .

build-fresh:
	docker build --no-cache -t ${IMAGE}:${TAG} .

run:
	docker run -it -v ${LOCAL_DATA}:/data -p 9987:9987/udp -p 10011:10011 -p 30033:30033 -p 41144:41144 --env-file .env ${IMAGE}:latest

run-local:
	docker run -it -v ${LOCAL_DATA}:/data -p 9987:9987/udp -p 10011:10011 -p 30033:30033 -p 41144:41144 --env-file .env ${IMAGE}:${TAG}

tag:
	docker tag ${IMAGE}:${TAG} ${IMAGE}:latest

push:
	docker push ${IMAGE}:latest
