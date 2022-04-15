# docker-teamspeak

A low-budget teamspeak server and discord bot combo (think free-tier container hosting).

## Instructions

Set the following environment variables on your server (or place in *.env* if using *Makefile*):

```txt
TS3SERVER_LICENSE=accept
PUID=503
PGID=503
DISCORD_TOKEN=[token bot will use to authenticate]
TS_ADMIN_PASS=[password to be set for the serverquery admin]
DISCORD_CHANNEL_ID=[ID of discord channel the bot will manipulate]
TS3_DISCO_DEBUG=false
LOCAL_DATA=[any local path for data storage (used by Makefile ONLY)']
```

### Makefile (Local Build) Instructions

1. Set environment variables (see above)

2. Build image locally (`make build`)

2. Run the container (`make run-local`)

### Makefile (Registry Build) Instructions

1. Set environment variables (see above)

2. Run the container (`make run`)

### Provisioned (Registry Build) Instructions

1. Set environment variables (see above).

2. Add volume mount for container path `/data`.

3. Set command to `/entrypoint.sh`.

4. Set container image to `docker.io/r06m00r3/ts3-disco-bot`.

5. Run the container.