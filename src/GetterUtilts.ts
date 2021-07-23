import { Guild, GuildMember, NewsChannel, Role, TextChannel, User } from "discord.js";
import { BotUser } from "./BotClient";

//#region User/Member

export function getUserFromMention(mention : string) : Promise<User>{
    if(!mention) return;
    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getUserByID(mention);
    }
    
    return getUserByID(matches[1]);
}

export function getUserByID(id : string) : Promise<User>{
    if(!id) return undefined;
    
    const member=BotUser.shard.broadcastEval(`this.users.fetch('${id}')`)
    .then(sentArray=>{
        if(!sentArray[0]) return undefined;

        return new User(BotUser, sentArray[0]);
    }).catch(()=>{
        return undefined;
    });
    return member;
}

export function getMemberFromMention(mention : string, guild : Guild) : Promise<GuildMember>{
    if(!mention||!guild) return;
    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getMemberByID(mention, guild);
    }
    
    return getMemberByID(matches[1], guild);
}

export function getMemberByID(id : string, guild : Guild) : Promise<GuildMember>{
    if(!id||!guild) return undefined;
    return guild.members.fetch(id).catch(()=>undefined);
}

//#endregion

//#region ServerChannels

export function getGuildByID(id:string) : Promise<Guild>{
    return BotUser.guilds.fetch(id).catch(()=>undefined);
}

export function getTextChannelByID(id : string, guild : Guild) : TextChannel{
    if(!id||!guild) return undefined;
    return <TextChannel>guild.channels.cache.find(channel=>channel.id===id&&channel.type==="text");
}

export function getNewsChannelByID(id : string, guild : Guild) : NewsChannel{
    if(!id||!guild) return undefined;
    return <NewsChannel>guild.channels.cache.find(channel=>channel.id===id&&channel.type==="news");
}

export function getGuildChannelByID(id : string, guild : Guild) : NewsChannel | TextChannel{
    if(!id||!guild) return undefined;
    const textChannel=getTextChannelByID(id, guild);
    if(textChannel) return textChannel;
    const newsChannel=getNewsChannelByID(id, guild);
    if(newsChannel) return newsChannel;
    return undefined;
}

export function getTextChannelFromMention(mention : string, guild : Guild) : TextChannel{
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getTextChannelByID(mention, guild);
    }
    
    return getTextChannelByID(matches[1], guild);
}

export function getNewsChannelFromMention(mention : string, guild : Guild) : NewsChannel{
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getNewsChannelByID(mention, guild);
    }
    
    return getNewsChannelByID(matches[1], guild);
}

export function getGuildChannelFromMention(mention : string, guild : Guild) : NewsChannel | TextChannel{
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getGuildChannelByID(mention, guild);
    }
    
    return getGuildChannelByID(matches[1], guild);
}

//#endregion

//#region Role

export function getRoleFromMention(mention : string, guild : Guild) : Promise<Role>{
    if(!mention||!guild) return;
    const matches=mention.match(/^<@&(\d+)>$/);

    if(!matches){
        return getRoleByID(mention, guild);
    }
    
    return getRoleByID(matches[1], guild);
}

export function getRoleByID(id : string, guild : Guild) : Promise<Role>{
    if(!id||!guild) return undefined;
    return guild.roles.fetch(id).catch(()=>undefined);
}

//#endregion