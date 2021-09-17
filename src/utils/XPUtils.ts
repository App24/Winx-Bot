import { BaseGuildTextChannel, Guild, Role, User } from "discord.js";
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
        let rankDetails;
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level+1);
            if(rankLevel){
                const rank=await getRoleById(rankLevel.roleId, guild);
                if(rank){
                    if(member.roles.cache.has(rank.id))
                        await member.roles.remove(rank, "lost transformation").catch(console.error);
                    rankDetails={rankLevel: rankLevel, rank: rank};
                }
            }
        }
        showLevelMessage(false, levelChannel, user, userLevel.level, rankDetails);
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
        let rankDetails;
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level);
            if(rankLevel){
                const rank=await getRoleById(rankLevel.roleId, guild);
                if(rank){
                    if(!member.roles.cache.has(rank.id))
                        member.roles.add(rank).catch(console.error);
                    rankDetails={rankLevel: rankLevel, rank: rank};
                }
            }
        }
        showLevelMessage(true, levelChannel, user, userLevel.level, rankDetails);
    }

    await Levels.set(guild.id, levels);
}

export async function showLevelMessage(levelUp:boolean, levelChannel:BaseGuildTextChannel, user:User, level:number, rankDetails: {rankLevel: RankLevel, rank: Role}){
    await levelChannel.send({content: Localisation.getTranslation(levelUp?"xp.level.up":"xp.level.down", user, level), allowedMentions: {users: [user.id]}});
    if(rankDetails){
        await levelChannel.send(Localisation.getTranslation(levelUp?"xp.transformation.earn":"xp.transformation.lost", user, capitalise(rankDetails.rank.name)));
        if(rankDetails.rankLevel.gifs&&rankDetails.rankLevel.gifs.length){
            await levelChannel.send(rankDetails.rankLevel.gifs[Math.floor(Math.random()*rankDetails.rankLevel.gifs.length)]);
        }
    }
}