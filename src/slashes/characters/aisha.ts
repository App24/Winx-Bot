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
    const fileStream=fs.createReadStream(`lines/aisha.txt`);

    const rl=readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const data=[];

    for await (const line of rl){
        data.push(line);
    }

    await Utils.reply(client, interaction, data[Math.floor(Math.random()*data.length)]);

    // await (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
    //     data:{
    //         type:5
    //     }
    // });

    // (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
    //     data:{
    //         content: "Test"
    //     }
    // });
}