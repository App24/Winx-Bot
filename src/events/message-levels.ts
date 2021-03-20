import * as Utils from '../Utils';
import Discord from 'discord.js';
import { MAX_MESSAGE_LENGTH, MAX_XP_PER_MESSAGE, MIN_MESSAGE_LENGTH } from '../Constants';

const levelCooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

module.exports=(client : import("../BotClient"))=>{
    client.on("message", async(message)=>{
        const Excludes=client.getDatabase("excludes");
        const ServerInfo=client.getDatabase("serverInfo");
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {});
        if(!serverInfo["minMessageLength"]){
            serverInfo["minMessageLength"]=MIN_MESSAGE_LENGTH;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        if(message.content.startsWith(process.env.PREFIX)||message.author.bot||message.content.length<serverInfo["minMessageLength"]||message.channel.type==="dm") return;
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
        if(!serverInfo["xpPerMessage"]){
            serverInfo["xpPerMessage"]=MAX_XP_PER_MESSAGE;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        if(!serverInfo["maxMessageLength"]){
            serverInfo["maxMessageLength"]=MAX_MESSAGE_LENGTH;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        const xpPerMessage=serverInfo["xpPerMessage"];
        // const xp=Math.min(xpPerMessage, message.content.length);
        const xp=Math.ceil((Math.min(message.content.length, serverInfo["maxMessageLength"])/serverInfo["maxMessageLength"])*xpPerMessage);
        await Utils.addXP(client, message.author, xp, message.guild, message.channel);
        return;
    });
}