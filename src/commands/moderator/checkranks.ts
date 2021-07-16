import { GuildMember, Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { asyncForEach, getServerDatabase } from "../../Utils";

class CheckRanksCommand extends Command{
    public constructor(){
        super();
        this.category=Moderator;
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(message : Message, args : string[]){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, message.guild.id);

        if(!levels) return message.reply(Localisation.getTranslation("error.empty.levels"));
        if(!ranks) return message.reply(Localisation.getTranslation("error.empty.ranks"));

        const members=await message.guild.members.fetch().then(promise=>promise.array());
        await message.channel.send(Localisation.getTranslation("checkranks.start"));
        await asyncForEach(members, async(member:GuildMember)=>{
            const user=levels.find(u=>u.userId===member.id);
            if(user){
                await asyncForEach(ranks, async(rank : RankLevel)=>{
                    const role=await getRoleByID(rank.roleId, message.guild);
                    if(!role) return;
                    if(user.level>=rank.level&&!member.roles.cache.has(role.id)){
                        await member.roles.add(role);
                    }else if(user.level<rank.level&&member.roles.cache.has(role.id)){
                        await member.roles.remove(role);
                    }
                });
            }
        });
        message.channel.send(Localisation.getTranslation("generic.done"));
    }
}

export=CheckRanksCommand;