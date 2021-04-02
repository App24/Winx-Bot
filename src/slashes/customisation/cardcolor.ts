import Canvas from 'canvas';
import Discord from 'discord.js';
import { CARD_HEX } from '../../Constants';
import * as Utils from '../../Utils';

module.exports={
    data: {
        guildOnly: true,
        premium: true
    }
}

module.exports.onRun=async (client:import("../../BotClient"), interaction, args : string[])=>{
    await (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type:5
        }
    });

    const channel=<Discord.GuildChannel>client.channels.resolve(interaction.channel_id);
    const UserSettings=client.getDatabase("userSettings");
    const user=await Utils.getUserByID(interaction.member.user.id, client);
    const serverUserSettings=await Utils.getServerDatabase(UserSettings, interaction.guild_id);
    let userSettings=await serverUserSettings.find(settings=>settings["id"]===user.id);
    if(!userSettings){
        await serverUserSettings.push({"id": user.id, "settings":[]});
        userSettings=await serverUserSettings.find(settings=>settings["id"]===user.id);
    }

    switch(args[0]){
        case "get":{
            let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(!cardColor){
                return (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                    data:{
                        content: "You not have a custom background color!"
                    }
                });
            }
            await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                data:{
                    content: "Done!"
                }
            });
            showColor(channel, cardColor["color"]);
        } break;
        case "set":{
            let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(!cardColor){
                await userSettings["settings"].push({"id": "cardColor", "color": CARD_HEX});
                cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            }
            let hex=args[1];
            if(hex.toLowerCase()!=="reset"){
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "That is not a valid color!"
                        }
                    });
                }
            }
            if(hex==="reset"){
                hex=CARD_HEX;
            }
            cardColor["color"]=hex;
            await UserSettings.set(interaction.guild_id, serverUserSettings);
            await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                data:{
                    content: "Done!"
                }
            });
            await showColor(channel, cardColor["color"]);
        } break;
        default:{
            (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                data:{
                    content: "How did you get here?"
                }
            });
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