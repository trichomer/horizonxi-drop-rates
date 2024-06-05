const fs = require('fs');
const readline = require('readline');

const dropRateMappings = {
  '@ALWAYS': '100%',
  '@VCOMMON': '24%',
  '@COMMON': '15%',
  '@UNCOMMON': '10%',
  '@RARE': '5%',
  '@VRARE': '1%',
  '@SRARE': '0.5%',
  '@URARE': '0.1%'
};

async function parseSQLFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let jsonData = {};
    let currentZoneId, currentMonsterName;

    for await (const line of rl) {
        if (line.startsWith('-- ZoneID:')) {
            [currentZoneId, currentMonsterName] = parseZoneMonster(line);

            if (!jsonData[currentZoneId]) {
                jsonData[currentZoneId] = {};
            }
            jsonData[currentZoneId][currentMonsterName] = { drops: {} };
        } else if (line.startsWith('INSERT INTO `mob_droplist`')) {
            const { monsterId, itemId, dropRate, itemName } = parseDropInfo(line);
            jsonData[currentZoneId][currentMonsterName].drops[itemId] = { name: itemName, dropRate };
        }
    }

    fs.writeFileSync('./src/data/zones.json', JSON.stringify(jsonData, null, 2));
}

function parseZoneMonster(line) {
    // line format is: "-- ZoneID: xxx - monsterName"
    const pattern = /-- ZoneID:\s{1,3}(\d+) - (.+)/;
    const match = line.match(pattern);

    if (match) {
        const zoneId = match[1].trim();
        const monsterName = match[2].trim();
        return [zoneId, monsterName];
    }

    return [null, null];
}


function parseDropInfo(line) {
    const parts = line.split('--');
    const sqlPart = parts[0].trim();
    const commentPart = parts[1].trim();

    const sqlValues = sqlPart.match(/\(([^)]+)\)/)[1].split(',');
    const monsterId = sqlValues[0].trim();
    const itemId = sqlValues[4].trim();
    let dropRateValue = sqlValues[5].trim();

    let dropRate = dropRateMappings[dropRateValue] || `${parseInt(dropRateValue, 10) / 10}%`;

    const itemName = commentPart.split('(')[0].trim();

    return { monsterId, itemId, dropRate, itemName };
}


parseSQLFile('./src/data/era_mob_droplist.sql');
