import { Message, GuildChannel, TextChannel, NewsChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { getMemberFromMention, getGuildChannelByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach, getAllMessages, secondsToTime } from "../../Utils";
import { addXP } from "../../XPUtils";

class CheckLevelsCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild;
        this.minArgs=1;
        this.usage=[new CommandUsage(true, "argument.user")];
        this.category=Moderator;
    }

    public async onRun(cmdArgs : CommandArguments){
        const member=await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if(!member) return cmdArgs.message.reply("That is not a member of this server!");
        if(member.user.bot) return cmdArgs.message.reply("That is a bot, and therefore has no levels!");
        const channels=cmdArgs.guild.channels.cache.array();

        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guild.id, DEFAULT_SERVER_INFO);
        const excluded=serverInfo.excludeChannels;
        
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, cmdArgs.guild.id);

        if(!levels||!levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        const user=levels.find(u=>u.userId===member.id);
        user.level=0;
        user.xp=0;
        await Levels.set(cmdArgs.guild.id, levels);

        await cmdArgs.channel.send(Localisation.getTranslation("checklevels.start"));
        const NTChannels=[];
        await asyncForEach(channels, async(channel:GuildChannel)=>{
            if((<any>channel).messages){
                if(excluded){
                    if(excluded.find(c=>c===channel.id)) return;
                }
                const NTChannel=await getGuildChannelByID(channel.id, cmdArgs.guild);
                NTChannels.push(NTChannel);
            }
        });
        await asyncForEach(NTChannels, async(channel:TextChannel | NewsChannel, index:number)=>{
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.start.channel", channel, index+1, NTChannels.length));
            const startTime=new Date().getTime();
            const messages=await getAllMessages(channel);
            let totalXp=0;
            await asyncForEach(messages, async(msg : Message)=>{
                if(msg.deleted) return;
                if(msg.content.toLowerCase().startsWith(PREFIX)) return;
                if(msg.author.id===member.id){
                    if(msg.content.length<serverInfo.minMessageLength) return;
                    const xp=Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength)/serverInfo.maxMessageLength)*serverInfo.maxXpPerMessage);
                    totalXp+=xp;
                }
            });
            await addXP(member.user, cmdArgs.guild, <TextChannel|NewsChannel>cmdArgs.channel, totalXp, false);
            const timeDifferent=new Date().getTime()-startTime;
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index+1, NTChannels.length, secondsToTime(timeDifferent/1000)));
        })
        cmdArgs.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=CheckLevelsCommand;