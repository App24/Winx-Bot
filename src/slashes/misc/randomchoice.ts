import Discord from 'discord.js';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: false
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    Utils.reply(client, interaction, args[Math.floor(Math.random()*args.length)]);
}