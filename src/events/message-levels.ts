import * as Utils from '../Utils';
import Discord from 'discord.js';

const levelCooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

module.exports=(client : import("../BotClient"))=>{
    client.on("message", async(message)=>{
        if(message.content.startsWith(process.env.PREFIX)||message.author.bot||message.content.length<3||message.channel.type==="dm") return;
        const Excludes=client.getDatabase("excludes");
        const ServerInfo=client.getDatabase("serverInfo");
        const excluded=await Excludes.get(message.guild.id);
        if(excluded){
            const channelExcluded=await excluded.find(u=>u["id"]===message.channel.id);
            if(channelExcluded){
                return;
            }
        }
        if(!levelCooldowns.has(message.guild.id)){
            levelCooldowns.set(message.guild.id, new Discord.Collection());
        }

        const now=Date.now();
        const timestamps=levelCooldowns.get(message.guild.id);
        const cooldownAmount=25;

        if(timestamps.has(message.author.id)){
            const expirationTime=timestamps.get(message.author.id)+cooldownAmount;

            if(now < expirationTime){
                return;
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(()=>timestamps.delete(message.author.id), cooldownAmount);
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        if(!serverInfo["xpPerMessage"]){
            serverInfo["xpPerMessage"]=5;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        const xpPerMessage=serverInfo["xpPerMessage"];
        const xp=Math.min(xpPerMessage, message.content.length);
        await Utils.addXP(client, message.author, xpPerMessage, message.guild, message.channel);
        return;
    });
}