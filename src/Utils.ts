import Discord, { DMChannel, Guild, TextChannel, User, Webhook, WebhookClient } from 'discord.js';
import {join} from 'path';
import fs from 'fs';
import BotClient from './BotClient';
import Keyv from './keyv-index';
import { Canvas } from 'canvas';
import { GuildMember } from 'discord.js';

export{asyncForEach, loadFiles, isClass, getLevelXP, getRoleByID, getChannelByID, getMemberByID, getUserByID, getUserFromMention, getChannelFromMention, getRoleFromMention, clamp, capitalise, addXP, blend, genRanHex, getServerDatabase, toHexString, hexToRGB, fitText, hasRole, isPatreon, getTextChannelByID, getTextChannelFromMention, getLogChannel, createLogEmbed, secondsToTime, createAPIMessage, reply};

const capXp=new Discord.Collection<string, Array<object>>();

async function asyncForEach(array:Array<any>, callback:Function) {
    for(let i =0; i < array.length; i++){
        let exit=await callback(array[i], i, array);
        if(exit===true)break;
    }
}

function loadFiles(directory : string){
    const files:Array<string>=[];
    const dirs:Array<string>=[];

    try{
        if(fs.existsSync(directory)){
            let dirContent=fs.readdirSync(directory);

            dirContent.forEach(path=>{
                const fullPath=join(directory, path);

                if(fs.statSync(fullPath).isFile())
                    files.push(fullPath);
                else 
                    dirs.push(fullPath);
            });

            dirs.forEach(dir=>{
                loadFiles(dir).forEach(file=>files.push(file));
            });
        }
    }catch(ex){
        console.log(ex);
        return;
    }

    return files;
}

function isClass(v) : boolean{
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

function getLevelXP(level : number){
    return level*2*100+50;
}

function getRoleByID(id : string, guild : Discord.Guild) : Promise<Discord.Role>{
    if(!id||!guild) return undefined;
    return guild.roles.fetch(id).catch(()=>undefined);
}

function getChannelByID(id : string, guild : Discord.Guild) : Discord.GuildChannel{
    if(!id||!guild) return undefined;
    return guild.channels.cache.find(channel=>channel.id===id);
}

function getMemberByID(id : string, guild : Discord.Guild) : Promise<Discord.GuildMember>{
    if(!id||!guild) return undefined;
    return guild.members.fetch(id).catch(()=>undefined);
}

function getTextChannelByID(id : string, guild : Discord.Guild) : Discord.TextChannel{
    if(!id||!guild) return undefined;
    return <Discord.TextChannel>guild.channels.cache.find(channel=>channel.id===id&&channel.type==="text");
}

async function getUserByID(id : string, client : BotClient) : Promise<Discord.User>{
    if(!id||!client) return undefined;
    
    const member=await client.shard.broadcastEval(`(async () => {
        const member=this.users.fetch('${id}');
        if(member){
            return member;
        }else{
            return undefined;
        };
        })();`).then(sentArray=>{
            if(!sentArray[0]) return undefined;
    
            return new Discord.User(client, sentArray[0]);
        }).catch(()=>{
            return undefined;
        });
    return member;
}

function getUserFromMention(mention : string, client : BotClient) : Promise<Discord.User>{
    if(!mention||!client) return;
    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getUserByID(mention, client);
    }
    
    return getUserByID(matches[1], client);
}

function getChannelFromMention(mention : string, guild : Discord.Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getChannelByID(mention, guild);
    }
    
    return getChannelByID(matches[1], guild);
}

function getTextChannelFromMention(mention : string, guild : Discord.Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getTextChannelByID(mention, guild);
    }
    
    return getTextChannelByID(matches[1], guild);
}

function getRoleFromMention(mention : string, guild : Discord.Guild){
    if(!mention||!guild) return;
    const matches=mention.match(/^<@&?(\d+)>$/);

    if(!matches){
        return getRoleByID(mention, guild);
    }
    
    return getRoleByID(matches[1], guild);
}

function clamp(value : number, min : number, max : number) : number{
    return Math.max(min, Math.min(value, max));
}

function capitalise(s : string) : string{
    var splitStr = s.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
}

function toHexString(byteArray : Array<number>) : string{
    return Array.from(byteArray, function(byte){
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function genRanHex(size : number) : string{
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function hexToRGB(hex : string){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}


function blend(a : number, b : number, w : number) : number{
    return (a*w)+(b*(1-w));
}

function hasRole(member : Discord.GuildMember, role : Discord.Role) : boolean{
    return member.roles.cache.find(other=>other.id===role.id) !== undefined;
}

async function getServerDatabase(database : Keyv, guildId : string, defaultValue : any =[]){
    let serverDatabase=await database.get(guildId);
    if(!serverDatabase){
        await database.set(guildId, defaultValue);
        serverDatabase=await database.get(guildId);
    }
    return serverDatabase;
}

function fitText(canvas : Canvas, text : string, maxFontSize : number, maxWidth : number) : Array<any>{
    const ctx=canvas.getContext("2d");
    let fontSize=maxFontSize+10;

    do{
        ctx.font=`${fontSize-=10}px sans-serif`;
    }while(ctx.measureText(text).width>maxWidth&&fontSize>10);

    return [ctx.font, fontSize];
}

async function isPatreon(user : Discord.User, guild : Discord.Guild, client : BotClient) : Promise<boolean>{
    const Paid=client.getDatabase("paid");
    const paid=await getServerDatabase(Paid, guild.id);
    const userPaid=paid.find(other=>{return other===user.id;});
    return userPaid!==undefined;
}

async function addXP(client : BotClient, user : Discord.User, xp : number, guild : Discord.Guild, channel : Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel){
    const Levels=client.getDatabase("levels");
    const Ranks=client.getDatabase("ranks");
    const ServerInfo=client.getDatabase("serverInfo");
    const serverInfo=await getServerDatabase(ServerInfo, guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
    if(!serverInfo["xpPerMessage"]){
        serverInfo["xpPerMessage"]=5;
        await ServerInfo.set(guild.id, serverInfo);
    }
    if(!serverInfo["messagesPerMinute"]){
        serverInfo["messagesPerMinute"]=50;
        await ServerInfo.set(guild.id, serverInfo);
    }
    const messagesPerMinute=serverInfo["messagesPerMinute"];

    if(!capXp.has(guild.id)){
        capXp.set(guild.id, []);
    }
    const data=capXp.get(guild.id);
    if(!data.find(other=>{return other["id"]===user.id;})){
        const _=capXp.get(guild.id);
        _.push({"id": user.id, "cap":[]});
        capXp.set(guild.id, _);
    }
    const xpData=capXp.get(guild.id).find(other=>{return other["id"]===user.id;})["cap"];
    if(xpData.length>=messagesPerMinute) return;
    const newDate=Date.now();
    xpData.push(newDate);
    setTimeout(()=>{
        const index=xpData.indexOf(newDate);
        xpData.splice(index, 1);
    }, 60*1000);

    const levels : Array<object>=await getServerDatabase(Levels, guild.id);
    let userInfo : object=await levels.find(u=>u["id"]===user.id);
    if(!userInfo){
        await levels.push({"id":user.id, "xp":0, "level":0});
        userInfo=await levels.find(u=>u["id"]===user.id);
    }
    const index=levels.indexOf(userInfo);
    userInfo["xp"]+=xp;
    let levelChannel=channel;
    if(serverInfo["levelChannel"]){
        const _channel=await getTextChannelByID(serverInfo["levelChannel"], guild);
        if(_channel) levelChannel=_channel;
    }
    while(userInfo["xp"]>=getLevelXP(userInfo["level"])){
        userInfo["xp"]-=getLevelXP(userInfo["level"]);
        userInfo["level"]++;
        let ranks=await Ranks.get(guild.id);
        if(ranks){
            let rankLevel=await ranks.find(u=>u["level"]===userInfo["level"]);
            if(rankLevel){
                let gifs=rankLevel["gifs"];
                const _user=await this.getMemberByID(user.id, guild);
                if(!_user){
                    return channel.send("error somewhere idk 🤷‍♀️🤷‍♀️");
                }
                const rank=await this.getRoleByID(rankLevel["role"], guild);
                _user.roles.add(rank);
                levelChannel.send(`${user} has earned a new transformation called ${this.capitalise(rank.name)}. Amazing work!`);
                if(gifs&&gifs.length){
                    levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                }
            }
        }
        levelChannel.send(`${user} has leveled up to level ${userInfo["level"]}!`);
    }
    levels[index]=userInfo;
    await Levels.set(guild.id, levels);
}

async function getLogChannel(client : BotClient, guild : Guild) : Promise<TextChannel>{
    const ServerInfo=client.getDatabase("serverInfo");
    const serverInfo=await getServerDatabase(ServerInfo, guild.id, {});
    if(!serverInfo["logChannel"]) return undefined;
    const channel=getTextChannelByID(serverInfo["logChannel"], guild);
    if(!channel) return undefined;
    return channel;
}

function createLogEmbed(situation : string, user : User, value : any){
    const embed=new Discord.MessageEmbed();
    embed.setTitle(situation);
    embed.addField("User", user, true);
    embed.addField("Value", value, true);
    return embed;
}

function secondsToTime(time : number){
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    var hours = Math.floor(time / 3600);
    time = time - hours * 3600;

    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }

    const times=[];
    if(hours>0) times.push(hours.toFixed(0)+" hour(s)");
    if(minutes>0) times.push(minutes.toFixed(0)+" minute(s)");
    times.push(seconds.toFixed(0)+" second(s)");

    return times.join(" and ");
}

async function reply(client:BotClient, interaction, response){
    let data={
        content: response
    };

    if(typeof response==="object"){
        data=<any>await createAPIMessage(client, interaction, response);
    }
    if(!data) return;

    (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type:4,
            data
        }
    });
}

async function createAPIMessage(client:BotClient, interaction, content){
    let channel=client.channels.resolve(interaction.channel_id);
    if(channel===null){
        channel=await (await getUserByID(interaction.user.id, client)).createDM();
    }
    if(!channel||channel==null) return;
    const {data, files}=await Discord.APIMessage.create(<TextChannel|DMChannel|User|GuildMember|Webhook|WebhookClient>client.channels.resolve(interaction.channel_id), content).resolveData().resolveFiles();
    return {...data, files};
}