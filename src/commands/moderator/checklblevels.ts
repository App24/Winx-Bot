import { Message, GuildMember, GuildChannel, TextChannel, NewsChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { getChannelByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, getLeaderboardMembers, asyncForEach, getAllMessages, secondsToTime } from "../../Utils";
import { addXP } from "../../XPUtils";

class CheckLBLevelsCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild;
        this.category=Moderator;
    }

    public async onRun(message : Message, args : string[]){
        const channels=message.guild.channels.cache.array();

        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        const excluded=serverInfo.excludeChannels;
        
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);

        if(!levels||!levels.length) return message.reply(Localisation.getTranslation("error.empty.levels"));
        
        const leaderboardLevels=await getLeaderboardMembers(message.guild);

        await asyncForEach(leaderboardLevels, async(topLevel:{userLevel: UserLevel, member: GuildMember})=>{
            topLevel.userLevel.level=0;
            topLevel.userLevel.xp=0;
        });
        leaderboardLevels.forEach(level=>{
            const index=levels.findIndex(u=>u.userId===level.userLevel.userId);
            levels[index]=level.userLevel;
        });
        await Levels.set(message.guild.id, levels);

        await message.channel.send(Localisation.getTranslation("checklevels.start"));
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
            await message.channel.send(Localisation.getTranslation("checklevels.start.channel", channel, index+1, NTChannels.length));
            const startTime=new Date().getTime();
            const messages=await getAllMessages(channel);
            await asyncForEach(leaderboardLevels, async(topLevel:{userLevel: UserLevel, member: GuildMember})=>{
                let totalXp=0;
                await asyncForEach(messages, async(msg : Message)=>{
                    if(msg.deleted) return;
                    if(msg.content.toLowerCase().startsWith(PREFIX)) return;
                    if(msg.author.id===topLevel.member.id){
                        if(msg.content.length<serverInfo.minMessageLength) return;
                        const xp=Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength)/serverInfo.maxMessageLength)*serverInfo.maxXpPerMessage);
                        totalXp+=xp;
                    }
                });
                await addXP(topLevel.member.user, message.guild, <TextChannel|NewsChannel>message.channel, totalXp, false);
            });
            const timeDifferent=new Date().getTime()-startTime;
            await message.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index+1, NTChannels.length, secondsToTime(timeDifferent/1000)));
        })
        message.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=CheckLBLevelsCommand;
