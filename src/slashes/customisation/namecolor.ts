import Canvas from 'canvas';
import Discord from 'discord.js';
import { CARD_NAME_DEFAULT } from '../../Constants';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: true,
        premium: true
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    const channel=<Discord.GuildChannel>client.channels.resolve(interaction.channel_id);
    const UserSettings=client.getDatabase(DatabaseType.UserSettings);
    const user=await Utils.getUserByID(interaction.member.user.id, client);
    const serverUserSettings=await Utils.getServerDatabase(UserSettings, interaction.guild_id);
    let userSettings=await serverUserSettings.find(settings=>settings["id"]===user.id);
    if(!userSettings){
        await serverUserSettings.push({"id": user.id, "settings":[]});
        userSettings=await serverUserSettings.find(settings=>settings["id"]===user.id);
    }

    switch(args[0]){
        case "get":{
            let cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
            if(!cardNameColor||cardNameColor["color"]===CARD_NAME_DEFAULT){
                return Utils.reply(client, interaction, "You do not have a custom name color!");
            }
            await Utils.reply(client, interaction, "Done!");
            showColor(channel, cardNameColor["color"]);
        } break;
        case "set":{
            let cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
            if(!cardNameColor){
                await userSettings["settings"].push({"id": "cardNameColor", "color": CARD_NAME_DEFAULT});
                cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
            }
            let hex=args[1];
            if(hex.toLowerCase()!=="reset"){
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return Utils.reply(client, interaction, "That is not a valid color!");
                }
            }
            if(hex==="reset"){
                hex=CARD_NAME_DEFAULT;
            }
            cardNameColor["color"]=hex;
            await UserSettings.set(interaction.guild_id, serverUserSettings);
            await Utils.reply(client, interaction, "Done!");
            if(hex!==CARD_NAME_DEFAULT)
            await showColor(channel, cardNameColor["color"]);
        } break;
        default:{
            Utils.reply(client, interaction, "How did you even get here?");
        } break;
    }
}

async function showColor(channel, color){
    const canvas = Canvas.createCanvas(700, 320);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle="#"+color;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
    await channel.send(`#${color}`, attachment);
}