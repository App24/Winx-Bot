import Canvas from 'canvas';
import Discord from 'discord.js';
import { BAR_END_HEX, BAR_START_HEX } from '../../Constants';
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
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(!barColor){
                return (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                    data:{
                        content: "You do not have a custom bar color!"
                    }
                });
            }
            switch(args[1]){
                case "both":{
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "Done!"
                        }
                    });
                    await showColor(channel, barColor["startColor"], "Start");
                    await showColor(channel, barColor["endColor"], "End");
                }break;
                case "end":{
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "Done!"
                        }
                    });
                    await showColor(channel, barColor["endColor"]);
                }break;
                case "start":{
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "Done!"
                        }
                    });
                    await showColor(channel, barColor["startColor"]);
                }break;
                default:{
                    (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "How did you get here?"
                        }
                    });
                }break;
            }
        } break;
        case "set":{
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(!barColor){
                await userSettings["settings"].push({"id": "barColor", "startColor": BAR_START_HEX, "endColor": BAR_END_HEX});
                barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            }
            let hex=args[2];
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
            let startHex=barColor["startColor"], endHex=barColor["endColor"];
            switch(args[1]){
                case "both":{
                    if(hex==="reset"){
                        startHex=BAR_START_HEX;
                        endHex=BAR_END_HEX;
                    }else{
                        startHex=hex;
                        endHex=hex;
                    }
                    barColor["startColor"]=startHex;
                    barColor["endColor"]=endHex;
                    await UserSettings.set(interaction.guild_id, serverUserSettings);
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: `Done!`
                        }
                    });
                    await showColor(channel, startHex, "Start");
                    await showColor(channel, endHex, "End");
                }break;
                case "start":{
                    if(hex==="reset"){
                        startHex=BAR_START_HEX;
                    }else{
                        startHex=hex;
                    }
                    barColor["startColor"]=startHex;
                    await UserSettings.set(interaction.guild_id, serverUserSettings);
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: `Done!`
                        }
                    });
                    await showColor(channel, startHex);
                }break;
                case "end":{
                    if(hex==="reset"){
                        endHex=BAR_END_HEX;
                    }else{
                        endHex=hex;
                    }
                    barColor["endColor"]=endHex;
                    await UserSettings.set(interaction.guild_id, serverUserSettings);
                    await (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: `Done!`
                        }
                    });
                    await showColor(channel, endHex);
                }break;
                default:{
                    (<any>client).api.webhooks(client.user.id, interaction.token).messages("@original").patch({
                        data:{
                            content: "How did you get here?"
                        }
                    });
                }break;
            }
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

async function showColor(channel, color, type?){
    const canvas = Canvas.createCanvas(700, 320);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle="#"+color;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
    let extra="";
    if(type){
        extra=`${type}:\n`
    }
    await channel.send(`${extra}#${color}`, attachment);
}