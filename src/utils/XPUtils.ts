import { BaseGuildTextChannel, Guild, User } from "discord.js";
import { BotUser } from "../BotClient";
import { getMemberById, getRoleById, GetTextNewsGuildChannelById } from "./GetterUtils";
import { Localisation } from "../localisation";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "./Utils";
import { capitalise } from "./FormatUtils";

/**
 * 
 * @param level 
 * @returns Amount of xp this level needs
 */
 export function getLevelXP(level : number){
    return Math.abs(level)*2*100+50;
}

export async function removeXP(xp : number, user : User, guild : Guild, channel : BaseGuildTextChannel){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo : ServerInfo=await getServerDatabase(ServerInfo, guild.id, DEFAULT_SERVER_INFO);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guild.id);
    const levels : UserLevel[]=await getServerDatabase(Levels, guild.id);

    const member=await getMemberById(user.id, guild);
    if(!member) return;

    let userLevel=levels.find(u=>u.userId===user.id);
    if(!userLevel){
        levels.push(new UserLevel(user.id));
        userLevel=levels.find(u=>u.userId===user.id);
    }

    userLevel.xp-=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel){
        const temp=await GetTextNewsGuildChannelById(serverInfo.levelChannel, guild);
        if(temp) levelChannel=temp;
    }

    while(userLevel.xp<0){
        if(userLevel.level<=0){
            userLevel.xp=0;
            break;
        }
        userLevel.level--;
        userLevel.xp+=getLevelXP(userLevel.level);
        await levelChannel.send(Localisation.getTranslation("xp.level.down", user, userLevel.level));
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level+1);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const rank=await getRoleById(rankLevel.roleId, guild);
                member.roles.remove(rank, "lost transformation").catch(console.error);
                await levelChannel.send(Localisation.getTranslation("xp.transformation.lost", user, capitalise(rank.name)));
                if(gifs&&gifs.length){
                    await levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                }
            }
        }
    }

    await Levels.set(guild.id, levels);
}

export async function addXP(xp : number, user : User, guild : Guild, channel : BaseGuildTextChannel, levelUpMessage:boolean=true){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, guild.id, DEFAULT_SERVER_INFO);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guild.id);
    const levels:UserLevel[]=await getServerDatabase(Levels, guild.id);

    const member=await getMemberById(user.id, guild);
    if(!member) return;

    let userLevel=levels.find(u=>u.userId===user.id);
    if(!userLevel){
        levels.push(new UserLevel(user.id));
        userLevel=levels.find(u=>u.userId===user.id);
    }

    userLevel.xp+=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel){
        const temp=await GetTextNewsGuildChannelById(serverInfo.levelChannel, guild);
        if(temp) levelChannel=temp;
    }

    while(userLevel.xp>=getLevelXP(userLevel.level)){
        userLevel.xp-=getLevelXP(userLevel.level);
        userLevel.level++;
        if(levelUpMessage)
            await levelChannel.send(Localisation.getTranslation("xp.level.up", user, userLevel.level));
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const rank=await getRoleById(rankLevel.roleId, guild);
                member.roles.add(rank).catch(console.error);
                if(levelUpMessage){
                    await levelChannel.send(Localisation.getTranslation("xp.transformation.earn", user, capitalise(rank.name)));
                    if(gifs&&gifs.length){
                        await levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                    }
                }
            }
        }
    }

    await Levels.set(guild.id, levels);
}