import { Guild, NewsChannel, TextChannel, User } from "discord.js";
import { BotUser } from "./BotClient";
import { DatabaseType } from "./structs/DatabaseTypes";
import { RankLevel } from "./structs/databaseTypes/RankLevel";
import { UserLevel } from "./structs/databaseTypes/UserLevel";
import { DEFAULT_SERVER_INFO, ServerInfo } from "./structs/databaseTypes/ServerInfo";
import { getChannelByID, getMemberByID, getRoleByID } from "./GetterUtilts";
import { getServerDatabase, getLevelXP, capitalise } from "./Utils";
import { Localisation } from "./localisation";

export async function removeXP(user : User, guild : Guild, channel : TextChannel | NewsChannel, xp : number){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo : ServerInfo=await getServerDatabase(ServerInfo, guild.id, DEFAULT_SERVER_INFO);
    const ranks : RankLevel[]=await Ranks.get(guild.id);
    const levels : UserLevel[]=await getServerDatabase(Levels, guild.id);

    let userLevel=levels.find(u=>u.userId===user.id);
    if(!userLevel){
        levels.push(new UserLevel(user.id));
        userLevel=levels.find(u=>u.userId===user.id);
    }
    const member=await getMemberByID(user.id, guild);
    if(!member) return;

    userLevel.xp-=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel){
        const temp=await getChannelByID(serverInfo.levelChannel, guild);
        if(temp) levelChannel=temp;
    }

    while(userLevel.xp<0){
        if(userLevel.level<=0){
            userLevel.xp=0;
            break;
        }
        userLevel.level--;
        userLevel.xp+=getLevelXP(userLevel.level);
        levelChannel.send(Localisation.getTranslation("xp.level.down", user, userLevel.level));
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level+1);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const rank=await getRoleByID(rankLevel.roleId, guild);
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

export async function addXP(user : User, guild : Guild, channel : TextChannel | NewsChannel, xp : number, levelUpMessage:boolean=true){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, guild.id, DEFAULT_SERVER_INFO);
    const ranks:RankLevel[]=await Ranks.get(guild.id);
    const levels:UserLevel[]=await getServerDatabase(Levels, guild.id);

    let userLevel=levels.find(u=>u.userId===user.id);
    if(!userLevel){
        levels.push(new UserLevel(user.id));
        userLevel=levels.find(u=>u.userId===user.id);
    }
    const member=await getMemberByID(user.id, guild);
    if(!member) return;

    userLevel.xp+=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel){
        const temp=await getChannelByID(serverInfo.levelChannel, guild);
        if(temp) levelChannel=temp;
    }

    while(userLevel.xp>=getLevelXP(userLevel.level)){
        userLevel.xp-=getLevelXP(userLevel.level);
        userLevel.level++;
        if(levelUpMessage)
            levelChannel.send(Localisation.getTranslation("xp.level.up", user, userLevel.level));
        if(ranks){
            const rankLevel=ranks.find(rank=>rank.level===userLevel.level);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const rank=await getRoleByID(rankLevel.roleId, guild);
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