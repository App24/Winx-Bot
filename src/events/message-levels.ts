import { Collection } from "discord.js";
import { BotUser } from "../BotClient"
import { PREFIX } from "../Constants";
import { DatabaseType } from "../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../Utils";
import { addXP } from "../XPUtils";

const levelCooldowns = new Collection<string, Collection<string, number>>();

export=()=>{
    BotUser.on("message", async(message)=>{
        if(message.content.toLowerCase().startsWith(PREFIX)||message.author.bot||message.channel.type==="dm") return;
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(message.content.length<serverInfo.minMessageLength) return;
        const excluded=serverInfo.excludeChannels;
        if(excluded){
            if(excluded.find(c=>c===message.channel.id)) return;
        }

        if(!levelCooldowns.has(message.guild.id)){
            levelCooldowns.set(message.guild.id, new Collection());
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

        const xp=Math.ceil((Math.min(message.content.length, serverInfo.maxMessageLength)/serverInfo.maxMessageLength)*serverInfo.maxXpPerMessage);
        await addXP(message.author, message.guild, message.channel, xp);

    });
}