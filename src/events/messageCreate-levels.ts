import { BaseGuildTextChannel, Collection } from "discord.js";
import { BotUser } from "../BotClient";
import { PREFIX } from "../Constants";
import { DatabaseType } from "../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../structs/databaseTypes/ServerInfo";
import { getServerDatabase, isDM } from "../Utils";
import { addXP } from "../XPUtils";

const levelCooldowns = new Collection<string, Collection<string, number>>();

const capXp=new Collection<string, XpCap[]>();

class XpCap{
    public id : string;
    public cap : number[];

    public constructor(id : string){
        this.id=id;
        this.cap=[];
    }
}

export=()=>{
    BotUser.on("messageCreate", async(message)=>{
        if(message.content.toLowerCase().startsWith(PREFIX)||message.author.bot||isDM(message.channel)) return;
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

        if(!capXp.has(message.guild.id)){
            capXp.set(message.guild.id, []);
        }
    
        const data=capXp.get(message.guild.id);
        if(!data.find(other=>other.id===message.author.id)){
            const temp=capXp.get(message.guild.id);
            temp.push(new XpCap(message.author.id));
            capXp.set(message.guild.id, temp);
        }
    
        const xpData=capXp.get(message.guild.id).find(other=>other.id===message.author.id).cap;
        if(xpData.length>=serverInfo.maxMessagePerMinute) return;
        const newDate=Date.now();
        xpData.push(newDate);
        setTimeout(()=>{
            const index=xpData.indexOf(newDate);
            xpData.splice(index, 1);
        }, 60*1000);

        const xp=Math.ceil((Math.min(message.content.length, serverInfo.maxMessageLength)/serverInfo.maxMessageLength)*serverInfo.maxXpPerMessage);
        await addXP(xp, message.author, message.guild, <BaseGuildTextChannel>message.channel);

    });
}