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

    const levels : UserLevel[] = await getServerDatabase(Levels, guild.id);
    let userLevel=await levels.find(u=>u.userId===user.id);
    if(!userLevel){
        await levels.push(new UserLevel(user.id));
        userLevel=await levels.find(u=>u.userId===user.id);
    }

    const userIndex=levels.indexOf(userLevel);
    userLevel.xp-=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel&&serverInfo.levelChannel.length){
        const _channel=await getChannelByID(serverInfo.levelChannel, guild);
        if(_channel) levelChannel=_channel;
    }
    while(userLevel.xp<0){
        if(userLevel.level<=0){
            userLevel.xp=0;
            break;
        }
        userLevel.level--;
        userLevel.xp+=getLevelXP(userLevel.level);
        let ranks : RankLevel[] =await Ranks.get(guild.id);
        levelChannel.send(Localisation.getTranslation("xp.level.down", user, userLevel.level));
        if(ranks){
            let rankLevel=await ranks.find(u=>u.level===userLevel.level+1);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const member=await getMemberByID(user.id, guild);
                if(!member) return;
                const rank=await getRoleByID(rankLevel.roleId, guild);
                member.roles.remove(rank, "lost transformation");
                levelChannel.send(Localisation.getTranslation("xp.transformation.lost", user, capitalise(rank.name)));
                if(gifs&&gifs.length){
                    levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                }
            }
        }
    }
    levels[userIndex]=userLevel;
    await Levels.set(guild.id, levels);
}

export async function addXP(user : User, guild : Guild, channel : TextChannel | NewsChannel, xp : number, levelUpMessage:boolean=true){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
    const serverInfo : ServerInfo=await getServerDatabase(ServerInfo, guild.id, DEFAULT_SERVER_INFO);

    const levels : UserLevel[] = await getServerDatabase(Levels, guild.id);
    let userLevel=await levels.find(u=>u.userId===user.id);
    if(!userLevel){
        await levels.push(new UserLevel(user.id));
        userLevel=await levels.find(u=>u.userId===user.id);
    }

    const userIndex=levels.indexOf(userLevel);
    userLevel.xp+=xp;
    let levelChannel=channel;
    if(serverInfo.levelChannel&&serverInfo.levelChannel.length){
        const _channel=await getChannelByID(serverInfo.levelChannel, guild);
        if(_channel) levelChannel=_channel;
    }
    while(userLevel.xp>=getLevelXP(userLevel.level)){
        userLevel.xp-=getLevelXP(userLevel.level);
        userLevel.level++;
        let ranks : RankLevel[] =await Ranks.get(guild.id);
        if(levelUpMessage)
            levelChannel.send(Localisation.getTranslation("xp.level.up", user, userLevel.level));
        if(ranks){
            let rankLevel=await ranks.find(u=>u.level===userLevel.level);
            if(rankLevel){
                const gifs=rankLevel.gifs;
                const member=await getMemberByID(user.id, guild);
                if(!member) return;
                const rank=await getRoleByID(rankLevel.roleId, guild);
                member.roles.add(rank);
                if(levelUpMessage){
                    levelChannel.send(Localisation.getTranslation("xp.transformation.earn", user, capitalise(rank.name)));
                    if(gifs&&gifs.length){
                        levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                    }
                }
            }
        }
    }
    levels[userIndex]=userLevel;
    await Levels.set(guild.id, levels);
}