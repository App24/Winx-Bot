import { BaseGuildTextChannel, Guild, GuildMember, NewsChannel, Role, TextChannel, ThreadChannel, User } from "discord.js";
import { BotUser } from "./BotClient";

//#region User/Member

export function getUserFromMention(mention : string){
    if(!mention) return;
    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getUserById(mention);
    }

    return getUserById(matches[1]);
}

export function getUserById(id : string):Promise<User>{
    if(!id) return;

    const member=BotUser.shard.broadcastEval((client, {id})=>client.users.fetch(id), {context:{id}})
    .then((sentArray:any[])=>{
        if(!sentArray[0]) return undefined;

        return new User(BotUser, sentArray[0]);
    }).catch(()=>undefined);

    return member;
}

export function getMemberFromMention(mention : string, guild : Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getMemberById(mention, guild);
    }

    return getMemberById(matches[1], guild);
}

export function getMemberById(id : string, guild : Guild):Promise<GuildMember>{
    if(!id||!guild) return;
    return guild.members.fetch(id).catch(undefined);
}

//#endregion

//#region ServerChannels

export function getGuildByID(id:string) : Promise<Guild>{
    return BotUser.guilds.fetch(id).catch(()=>undefined);
}

export function GetTextNewsGuildChannelFromMention(mention : string, guild : Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return GetTextNewsGuildChannelById(mention, guild);
    }
    
    return GetTextNewsGuildChannelById(matches[1], guild);
}

export function GetTextNewsGuildChannelById(id : string, guild : Guild) : TextChannel | NewsChannel{
    if(!id||!guild) return undefined;
    return <TextChannel | NewsChannel> guild.channels.cache.find(channel=>channel.id===id&&channel.isText());
}

export function GetTextBasedGuildChannelFromMention(mention : string, guild : Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return GetTextBasedGuildGuildChannelById(mention, guild);
    }
    
    return GetTextBasedGuildGuildChannelById(matches[1], guild);
}

export function GetTextBasedGuildGuildChannelById(id : string, guild : Guild) : BaseGuildTextChannel{
    if(!id||!guild) return undefined;
    return <BaseGuildTextChannel> guild.channels.cache.find(channel=>channel.id===id&&channel.isText());
}

export function GetThreadChannelFromMention(mention : string, guild : Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return GetThreadChannelById(mention, guild);
    }
    
    return GetThreadChannelById(matches[1], guild);
}

export function GetThreadChannelById(id : string, guild : Guild) : ThreadChannel{
    if(!id||!guild) return undefined;
    return <ThreadChannel> guild.channels.cache.find(channel=>channel.id===id&&channel.isThread());
}

//#endregion

//#region Role

export function getRoleFromMention(mention : string, guild : Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<@&(\d+)>$/);

    if(!matches){
        return getRoleById(mention, guild);
    }
    
    return getRoleById(matches[1], guild);
}

export function getRoleById(id : string, guild : Guild) : Promise<Role>{
    if(!id||!guild) return undefined;
    return guild.roles.fetch(id).catch(()=>undefined);
}

//#endregion