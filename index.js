// requirements
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");
const discord = require("discord.js");
const mongoose = require("mongoose");
const path = require('path');

// env variables
require('dotenv').config({
    path: path.join(__dirname, '.env'),
})
const token = process.env.token;
const db_uri = process.env.db_uri;

const users = require("./db/user.js");

// initialise
mongoose.connect(
    db_uri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const client = new discord.Client({intents: [discord.GatewayIntentBits.Guilds]});

// start of bot
let commandTmp = []
let commands = []
let interactions = []
client.once('ready', () => {
    console.log('Bot Ready!');

    let commandsFiles = fs.readdirSync(path.join(__dirname, './commands'));
    let interactionsFiles = fs.readdirSync(path.join(__dirname, './interactions'));

    commandsFiles.forEach((file, i) => {
        commandTmp[i] = require('./commands/' + file);
        commands = [
            ...commands,
            {
                name: file.split('.')[0],
                description: commandTmp[i].description,
                init: commandTmp[i].init,
                options: commandTmp[i].options
            },
        ];
    });

    interactionsFiles.forEach((file, i) => {
        let interaction = require('./interactions/' + file);
        interactions[i] = {
            name: file.split('.')[0],
            description: interaction.description,
            init: interaction.init
        }
    });

    const rest = new REST({ version: '9' }).setToken(token);
    rest.put(Routes.applicationCommands(client.application.id), {
        body: commands,
    })
        .then(() => {
            console.log('Commands registered!');
        })
        .catch(console.error);
});

client.login(token);

client.on('interactionCreate', async interaction => {
    let user = await users.findOne({ user_id: interaction.user.id });

    // create / update user profile
    if(!user) {
        user = new users({
            user_id: interaction.user.id,
            username: interaction.user.username,
            allowed_codes: 3,
            total_scans: 0
        });
        user.save();
    }
    if(user.username !== interaction.user.username) {
        user.username = interaction.user.username;
        user.save();
    }
    
    // commands
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        const selectedCommand = commands.find(c => commandName === c.name);
        selectedCommand.init(interaction, client);
    }

    // other interactions
    if (interaction.isModalSubmit() || interaction.isButton()) {
        const { customId } = interaction;
        const selectedCommand = interactions.find(c => customId === c.name);
        selectedCommand.init(interaction, client);
    }
})
