# mbentley/teamspeak

docker image for TeamSpeak 3 Server
based off of `alpine:latest`
or
based off of `debian:bullseye`

There are now two images; one is built on Alpine Linux and is about 30 MB with TS3; the other is Debian and that image with TS3 is about 175 MB.  Both images are functionally the same.

- `latest`, `alpine` - based on Alpine Linux
- `debian` - based on Debian bullseye

To pull this image:
`docker pull mbentley/teamspeak`

**Note**: This Dockerfile will _always_ include the very latest version of TS3 available.  For updates, re-pull the image and re-create the container, with your persistent data stored outside of the container.

Example usage (no persistent storage; for testing only - you will lose your data when the container is removed):

```
docker run -d --name teamspeak \
  -e PUID=503 \
  -e PGID=503 \
  -e TS3SERVER_GDPR_SAVE=false \
  -e TS3SERVER_LICENSE=accept \
  -p 9987:9987/udp -p 30033:30033 -p 10011:10011 -p 41144:41144 \
  mbentley/teamspeak
```

## License Agreement

Starting with [TeamSpeak 3.1.0](https://support.teamspeakusa.com/index.php?/Knowledgebase/Article/View/344/16/how-to-accept-the-server-license-agreement-server--310), the license agreement must be accepted before you can run TeamSpeak.  To accept the agreement, you need to do one of the following:

- Add the following to your run command: `-e TS3SERVER_LICENSE=accept` to pass an environment variable
- Add a command line parameter at the end of your run command to accept the license `license_accepted=1`
- Create a file named `.ts3server_license_accepted` in the persistent storage directory

## Advanced usage with persistent storage

1. On your host, create necessary directories, files, and set permissions:

    - `mkdir -p /data/teamspeak`
    - `chown -R 503:503 /data/teamspeak`

1. Start container:

    ```
    docker run -d --restart=always --name teamspeak \
      -e PUID=503 \
      -e PGID=503 \
      -e TS3SERVER_GDPR_SAVE=false \
      -e TS3SERVER_LICENSE=accept \
      -p 9987:9987/udp -p 30033:30033 -p 10011:10011 -p 41144:41144 \
      -v /data/teamspeak:/data \
      mbentley/teamspeak
    ```

In order to get the credentials for your TS server, check the container logs as it will output the `serveradmin` password and your `ServerAdmin` privilege key.

## Setting a custom UID and GID

In order to set a custom UID and GID of the teamspeak user/group, set the `PUID` and `PGID` environment variables as necessary.  Both default to `503` if not specified.

## Disabling IP logging for GDPR

In order to disable client IP address logging to adhere to GDPR, set `TS3SERVER_GDPR_SAVE` to `true`.  It defaults to `false`.

## Additional Parameters

For additional parameters, check the `Commandline Parameters` section of the `TeamSpeak Server - Quickstart Guide`.  You can also get Either add the parameters to `ts3server.ini` or specify them after the Docker image name.  The quickstart guide ships with the image and can be viewed with:

```
docker run -t --rm --entrypoint cat mbentley/teamspeak /opt/teamspeak/doc/server_quickstart.md
```

## Example directly passing parameters

```
docker run -d --restart=always --name teamspeak \
  -e PUID=503 \
  -e PGID=503 \
  -e TS3SERVER_GDPR_SAVE=false \
  -e TS3SERVER_LICENSE=accept \
  -p 9987:9987/udp -p 30033:30033 -p 10011:10011 -p 41144:41144 \
  -v /data/teamspeak:/data \
  mbentley/teamspeak \
  serveradmin_password=test1234
```

## Use a custom .ini file

1. Create directory, touch the ini files, set permissions:

    ```
    mkdir -p /data/teamspeak
    touch /data/teamspeak/ts3server.ini
    chown -R 503:503 /data/teamspeak
    ```

1. Add config parameters to the `ts3server.ini`:

    ```
    default_voice_port=9987
    filetransfer_ip=0.0.0.0
    filetransfer_port=30033
    query_port=10011
    query_ssh_port=10022
    ```

1. Start container with the `inifile=/data/ts3server.ini` parameter to tell TeamSpeak where the ini file is:

    ```
    docker run -d --restart=always --name teamspeak \
      -e PUID=503 \
      -e PGID=503 \
      -e TS3SERVER_LICENSE=accept \
      -p 9987:9987/udp -p 30033:30033 -p 10011:10011 -p 41144:41144 \
      -v /data/teamspeak:/data \
      mbentley/teamspeak \
      inifile=/data/ts3server.ini
    ```