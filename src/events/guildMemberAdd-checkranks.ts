import { GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { getRoleById } from "../GetterUtils";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach } from "../Utils";

export=()=>{
    BotUser.on("guildMemberAdd", async(member:GuildMember)=>{
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const levels:UserLevel[]=await getServerDatabase(Levels, member.guild.id);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, member.guild.id);
        if(!levels||!ranks) return;
        const user=levels.find(u=>u.userId===member.id);
        if(user){
            await asyncForEach(ranks, async(rank : RankLevel)=>{
                const role=await getRoleById(rank.roleId, member.guild);
                if(!role) return;
                if(user.level>=rank.level&&!member.roles.cache.has(role.id)){
                    await member.roles.add(role);
                }else if(user.level<rank.level&&member.roles.cache.has(role.id)){
                    await member.roles.remove(role);
                }
            });
        }
    });
};