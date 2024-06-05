const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mob')
        .setDescription('Search for a mob by name.')
        .addStringOption(option => 
            option.setName('name')
            .setDescription('Mob name')
            .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name').toLowerCase();
        const zones = JSON.parse(fs.readFileSync('./data/zones.json', 'utf8'));


        let results = [];
        for (const [zone, monsters] of Object.entries(zones)) {
            for (const [monsterName, monsterData] of Object.entries(monsters)) {
                if (monsterName.toLowerCase().includes(name)) {
                    results.push({ zone, monsterName, monsterData });
                }
            }
        }

        let embed = new EmbedBuilder()
            .setTitle('Results')
            .setColor(0x0099FF);

        if (results.length === 0) {
            embed.setDescription('No results found.');
        } else {
            results.forEach(result => {
                const zoneName = interaction.client.zoneMapping[result.zone] || `Unknown Zone (${result.zone})`;
                let dropDescription = '';
                if (Object.keys(result.monsterData.drops).length === 0) {
                    dropDescription = 'No drops?!?!?!';
                } else {
                    for (const [dropId, dropInfo] of Object.entries(result.monsterData.drops)) {
                        dropDescription += `${dropInfo.name} (${dropInfo.dropRate})\n`;
                    }
                }
                embed.addFields({ name: `${zoneName} - ${result.monsterName}`, value: dropDescription });
            });
        }

        await interaction.reply({ embeds: [embed] });

    },
};
