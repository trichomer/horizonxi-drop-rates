require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const parseZoneIds = require('./utils/parseZoneIds');

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`Registering command: ${command.data.name}`);
    client.commands.set(command.data.name, command);
}


(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();


client.once('ready', () => {
    console.log('Bot is online!');
    client.zoneMapping = parseZoneIds('./data/zone_ids.txt');
    //console.log('Loaded Zone Mapping:', client.zoneMapping);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
