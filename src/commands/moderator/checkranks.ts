import { GuildMember } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";

class CheckRanksCommand extends Command{
    public constructor(){
        super();
        this.category=Moderator;
        this.access=CommandAccess.Moderators;
        this.available=CommandAvailable.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const levels:UserLevel[]=await getServerDatabase(Levels, cmdArgs.guildId);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guildId);

        if(!levels) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));
        if(!ranks) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));

        const members=await cmdArgs.guild.members.fetch().then(promise=>Array.from(promise.values()));
        await cmdArgs.message.reply(Localisation.getTranslation("checkranks.start"));
        await asyncForEach(members, async(member:GuildMember)=>{
            const user=levels.find(u=>u.userId===member.id);
            if(user){
                await asyncForEach(ranks, async(rank : RankLevel)=>{
                    const role=await getRoleById(rank.roleId, cmdArgs.guild);
                    if(!role) return;
                    if(user.level>=rank.level&&!member.roles.cache.has(role.id)){
                        await member.roles.add(role);
                    }else if(user.level<rank.level&&member.roles.cache.has(role.id)){
                        await member.roles.remove(role);
                    }
                });
            }
        });
        cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    }
}

export=CheckRanksCommand;