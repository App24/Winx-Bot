import * as Utils from '../Utils';
import Discord, { GuildMember } from 'discord.js';
import DatabaseType from '../DatabaseTypes';

module.exports=(client : import("../BotClient"))=>{
    client.on("guildMemberAdd", async(member:GuildMember)=>{
        const Levels=client.getDatabase(DatabaseType.Levels);
        const Ranks=client.getDatabase(DatabaseType.Ranks);
        const levels=await Levels.get(member.guild.id);
        const ranks=await Ranks.get(member.guild.id);
        if(!levels||!ranks) return;
        const user=await levels.find(u=>u["id"]===member.user.id);
        if(user){
            await Utils.asyncForEach(ranks, async(rank) => {
                if(user["level"]>=rank["level"]){
                    const role=await Utils.getRoleByID(rank["role"], member.guild);
                    if(!role) return;
                    member.roles.add(role);
                }
            });
        }
    });
}