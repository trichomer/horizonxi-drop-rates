const fs = require('fs');

function parseZoneIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const zoneMapping = {};

    for (let line of lines) {
        const parts = line.trim().split('-').map(part => part.trim());
        if (parts.length >= 3) {
            const zoneId = parts[0];
            const zoneName = parts[2];
            zoneMapping[zoneId] = zoneName;
        }
    }

    return zoneMapping;
}

module.exports = parseZoneIds;