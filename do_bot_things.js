// imports //////////////////////////////////////////////////////////////////////////////
const { TeamSpeak } = require("ts3-nodejs-library")
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const sqlite = require('better-sqlite3');
require('dotenv');

// declare constants ////////////////////////////////////////////////////////////////////
const db = sqlite('/data/disco-bot.db');
const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
const ts_config = {
    "host": "localhost",
    "queryport": 10011,
    "serverport": 9987,
    "username": "serveradmin",
    "password": process.env.TS_ADMIN_PASS,
    "nickname": "serveradmin"
};

// define functions /////////////////////////////////////////////////////////////////////

function log(msg, priority) {
    if (priority || process.env.TS3_DISCO_DEBUG === "true") console.log("TS3_Disco_Bot / " + new Date().toLocaleString() + ' / ' + msg)
}

function fail(msg) {
    log(msg, true)
    throw new Error(msg)
}

async function send_content(channel, alias, content) {
    var message = await channel.send(content)
    if (!message) log('WARNING: channel.send failed', true)
    else {
        db.prepare("REPLACE INTO DISCORD_IDS (alias, id) VALUES (?1, ?2)").run({ 1: alias, 2: message.id })
        log('Inserted (new) message ID into database.')
    }
}

async function setChannelName(clients, channel, state) {
    const epochTime = Math.round(Date.now() / 1000) // in seconds
    // prepare the edit channel name if we go from 0 to 1+ clients, 1+ to 0 clients, or we just started this process
    const stateChange = (state.lastCount === 0 && clients.length > 0) || (state.lastCount > 0 && clients.length === 0) || state.lastCount === -1
    if (stateChange && state.lastEpochTime !== 0) log(`${300 - (epochTime - state.lastEpochTime)} seconds until a channel rename is attempted.`)
    if (stateChange && state.lastEpochTime + 300 < epochTime) {
        // wait at least 5 minutes before setting channel name to avoid reaching API limit; do not set channel name if there was no change, unless this is the first execution
        state.lastEpochTime = epochTime
        state.lastCount = clients.length
        var icon = (clients.length > 0 ? '🔊' : '🔈')
        try {
            await channel.setName(`${icon}${process.env.CHANNEL_BASE_NAME}`)
            log('Set channel name.')
        } catch {
            log('WARNING: could not set channel name', true)
        }
    }
}

function makeEmbed(clients) {
    var clientList = ""
    clients.forEach(client => {
        clientList += ("\n  - " + client.nickname)
    })
    const content = '>>> Client Count: ' + clients.length + (clients.length > 0 ? '\nClients:' + clientList : '')
    const embed = new EmbedBuilder()
        .setTitle('TS3 Server Details')
        .setDescription(content)
    return embed
}

async function setChannelMessage(clients, channel) {

    // get existing message id
    const row = db.prepare("SELECT id from DISCORD_IDS WHERE alias='ts3_status'").get()
    if (typeof row !== 'undefined') {
        // if exists, fetch message and edit
        log('Retrieved message ID from database.')
        var message;
        try {
            message = await channel.messages.fetch(row.id)
            log('Found message matching ID.')
        } catch {
            log('WARNING: Could not find message.', true)
            return -1
        }

        try {
            await message.edit({ embeds: [makeEmbed(clients)] })
            log('Message updated.')
            return 0
        } catch {
            log('WARNING: message.edit failed', true)
            return -1
        }
    }
    else {
        // otherwise, send new message and store id
        log('Failed to retrieve message id from database.')
        return -1
    }

}

// Define state /////////////////////////////////////////////////////////////////////////

var state = {
    'lastCount': -1,
    'lastEpochTime': 0
}

// Set event handler ////////////////////////////////////////////////////////////////////

discord.on('ready', () => {
    TeamSpeak.connect(ts_config).then(async teamspeak => {
        log('Connected to TS3 Server Query.')
        while (true) {
            var clients = await teamspeak.clientList({ clientType: 0 })
            if (!clients) log('WARNING: could not fetch teamspeak clients', true)
            else {
                log('Fetched client list.')
                const channel = discord.channels.resolve(process.env.DISCORD_CHANNEL_ID);
                if (!channel) fail(`ERROR: Can't find a channel with the ID \`${process.env.DISCORD_CHANNEL_ID}\``);
                log('Resolved channel.')

                var res = await setChannelMessage(clients, channel)
                if (res === -1) await send_content(channel, 'ts3_status', { embeds: [makeEmbed(clients)] })
                await setChannelName(clients, channel, state)
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    })
});

// main routine /////////////////////////////////////////////////////////////////////////

db.exec("CREATE TABLE IF NOT EXISTS DISCORD_IDS (alias VARCHAR NOT NULL PRIMARY KEY, id VARCHAR NOT NULL)");
discord.login(process.env.DISCORD_TOKEN)
