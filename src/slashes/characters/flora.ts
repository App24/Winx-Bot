import Discord from 'discord.js';
import * as Utils from '../../Utils';
import fs from 'fs';
import readline from 'readline';

module.exports={
    data: {
        guildOnly: false
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    const fileStream=fs.createReadStream(`lines/flora.txt`);

    const rl=readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const data=[];

    for await (const line of rl){
        data.push(line);
    }

    Utils.reply(client, interaction, data[Math.floor(Math.random()*data.length)]);
}