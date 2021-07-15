import { Message, GuildChannel, TextChannel, NewsChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { getMemberFromMention, getChannelByID } from "../../GetterUtilts";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach, getAllMessages, secondsToTime } from "../../Utils";
import { addXP } from "../../XPUtils";

class CheckLevelsCommand extends Command{
    public constructor(){
        super("Checks the levels of a specific user");
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild;
        this.minArgs=1;
        this.usage="<user>";
        this.category=Moderator;
    }

    public async onRun(message : Message, args : string[]){
        const member=await getMemberFromMention(args[0], message.guild);
        if(!member) return message.reply("That is not a member of this server!");
        if(member.user.bot) return message.reply("That is a bot, and therefore has no levels!");
        const channels=message.guild.channels.cache.array();

        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        const excluded=serverInfo.excludeChannels;
        
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        const user=levels.find(u=>u.userId===member.id);
        user.level=0;
        user.xp=0;
        await Levels.set(message.guild.id, levels);

        await message.channel.send("Started checking each channel! This may take a very, very long time!");
        const NTChannels=[];
        await asyncForEach(channels, async(channel:GuildChannel)=>{
            if((<any>channel).messages){
                if(excluded){
                    if(excluded.find(c=>c===channel.id)) return;
                }
                const NTChannel=await getChannelByID(channel.id, message.guild);
                NTChannels.push(NTChannel);
            }
        });
        await asyncForEach(NTChannels, async(channel:TextChannel | NewsChannel, index:number)=>{
            await message.channel.send(`Started checking channel: ${channel} ${index+1}/${NTChannels.length}`);
            const startTime=new Date().getTime();
            const messages=await getAllMessages(channel);
            let totalXp=0;
            await asyncForEach(messages, async(msgs : Message[])=>{
                await asyncForEach(msgs, async(msg:Message)=>{
                    if(msg.deleted) return;
                    if(msg.content.toLowerCase().startsWith(PREFIX)) return;
                    if(msg.author.id===member.id){
                        if(msg.content.length<serverInfo.minMessageLength) return;
                        const xp=Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength)/serverInfo.maxMessageLength)*serverInfo.maxXpPerMessage);
                        totalXp+=xp;
                    }
                });
            });
            await addXP(member.user, message.guild, <TextChannel|NewsChannel>message.channel, totalXp, false);
            const timeDifferent=new Date().getTime()-startTime;
            await message.channel.send(`Finished checking channel: ${channel} ${index+1}/${NTChannels.length}. Took ${secondsToTime(timeDifferent/1000)}`);
        })
        message.channel.send("Done!");
    }
}

export=CheckLevelsCommand;