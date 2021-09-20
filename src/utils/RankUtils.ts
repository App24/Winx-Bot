import { BotUser } from "../BotClient";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { getServerDatabase } from "./Utils";

export async function getNextRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    });
    let rankToReturn:RankLevel;
    for(const rank of ranks){
        if(rank.level<=currentLevel) continue;
        rankToReturn=rank;
        break;
    }
    return rankToReturn;
}

export async function getCurrentRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    });
    let rankToReturn:RankLevel;
    for(const rank of ranks){
        if(rank.level>currentLevel) break;
        if(rank.level<=currentLevel){
            rankToReturn=rank;
        }
    }
    return rankToReturn;
}

export async function getPreviousRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    });
    let currentRank:RankLevel;
    for(const rank of ranks){
        if(rank.level>currentLevel) break;
        if(rank.level<=currentLevel){
            currentRank=rank;
        }
    }
    let rankToReturn:RankLevel;
    for(const rank of ranks){
        if(rank.level>=currentLevel||rank.level===currentRank.level) break;
        if(rank.level<currentLevel){
            rankToReturn=rank;
        }
    }
    return rankToReturn;
}