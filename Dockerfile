# rebased/repackaged base image that only updates existing packages
FROM mbentley/alpine:latest

ENV TS_DIRECTORY=/opt/teamspeak

# for cache busting
ARG TS_SERVER_VER

# install the latest teamspeak
RUN apk add --no-cache bzip2 ca-certificates coreutils libstdc++ su-exec tini w3m &&\
  TS_SERVER_VER="$(w3m -dump https://www.teamspeak.com/downloads | grep -m 1 'Server 64-bit ' | awk '{print $NF}')" &&\
  wget https://files.teamspeak-services.com/releases/server/${TS_SERVER_VER}/teamspeak3-server_linux_alpine-${TS_SERVER_VER}.tar.bz2 -O /tmp/teamspeak.tar.bz2 &&\
  mkdir -p /opt &&\
  tar jxf /tmp/teamspeak.tar.bz2 -C /opt &&\
  mv /opt/teamspeak3-server_* ${TS_DIRECTORY} &&\
  rm /tmp/teamspeak.tar.bz2 &&\
  apk del bzip2 w3m

COPY entrypoint.sh /entrypoint.sh
EXPOSE 9987/udp 10011 30033 41144
ENTRYPOINT ["/entrypoint.sh"]

# custom discord bot logic
RUN mkdir -p /opt/bot && cd /opt/bot && apk add --update nodejs npm && npm install --save ts3-nodejs-library discord.js dotenv better-sqlite3 && npm install -g forever
COPY do_bot_things.js /opt/bot/do_bot_things.js
