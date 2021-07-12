import {join} from 'path';
import fs from 'fs';
import Keyv from './keyv-index';
import { APIMessage, Channel, Guild, GuildChannel, GuildMember, Message, MessageAttachment, NewsChannel, Role, TextChannel, User } from 'discord.js';
import { BotUser } from './BotClient';
import { DatabaseType } from './structs/DatabaseTypes';
import { PatreonInfo } from './structs/databaseTypes/PatreonInfo';
import { Canvas, createCanvas } from 'canvas';
import { getMemberByID, getUserByID } from './GetterUtilts';
import { RankLevel } from './structs/databaseTypes/RankLevel';

export async function asyncForEach(array:Array<any>, callback:Function) {
    for(let i =0; i < array.length; i++){
        let exit=await callback(array[i], i, array);
        if(exit===true)break;
    }
}

export function loadFiles(directory : string){
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

export function getLevelXP(level : number){
    return Math.abs(level)*2*100+50;
}

export function clamp(value : number, min : number, max : number) : number{
    return Math.max(min, Math.min(value, max));
}

export function genRanHex(size : number) : string{
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function toHexString(byteArray : Array<number>) : string{
    return Array.from(byteArray, function(byte){
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

export async function getServerDatabase(database : Keyv, guildId : string, defaultValue : any =[]){
    let serverDatabase=await database.get(guildId);
    if(!serverDatabase){
        await database.set(guildId, defaultValue);
        serverDatabase=await database.get(guildId);
    }
    return serverDatabase;
}

export function capitalise(s : string) : string{
    var splitStr = s.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

export function secondsToTime(time : number){
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    var hours = Math.floor(time / 3600);
    time = time - hours * 3600;

    const times=[];
    if(hours>0) times.push(hours.toFixed(0)+" hour(s)");
    if(minutes>0) times.push(minutes.toFixed(0)+" minute(s)");
    times.push(seconds.toFixed(0)+" second(s)");

    return times.join(" and ");
}

export function isDM(channel : Channel){
    return channel.type==="dm";
}

export function getBotMember(guild : Guild) : Promise<GuildMember>{
    return getMemberByID(BotUser.user.id, guild);
}

export async function getBotRoleColor(guild : Guild) : Promise<number>{
    const defaultcolor=5793266;
    if(!guild) return defaultcolor;
    const member=await getBotMember(guild);
    if(!member) return defaultcolor;
    if(!member.roles) return defaultcolor;
    if(!member.roles.color) return defaultcolor;
    return member.roles.color.color;
}

export function getStringTime(time : number, sliceAmount : number=19){
    return new Date(time).toISOString().replace("T", " ").slice(0, sliceAmount);
}

export async function isPatreon(userId : string, guildId : string) : Promise<boolean>{
    if(!userId||!guildId) return false;
    const Patreon=BotUser.getDatabase(DatabaseType.Paid);
    const patreon:PatreonInfo[]=await Patreon.get(guildId);
    if(!patreon||!patreon.length) return false;
    return patreon.find(user=>user.userId===userId)!==undefined;
}

export function canvasToMessageAttachment(canvas : Canvas, fileName:string="color"){
    return new MessageAttachment(canvas.toBuffer(), `${fileName}.png`);
}

export function canvasColor(color : string, width : number=700, height : number=320){
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle="#"+color;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    return canvas;
}

export function isHexColor(str : string){
    return new RegExp(/[a-f0-9]{6}/g).test(str);
}

export async function getNextRank(currentLevel : number, guildId : string) : Promise<RankLevel>{
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return undefined;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    })
    let rankToReturn:RankLevel;
    for(let rank of ranks){
        if(rank.level<=currentLevel) continue;
        rankToReturn=rank;
        break;
    }
    return rankToReturn;
}

export async function getCurrentRank(currentLevel : number, guildId : string) : Promise<RankLevel>{
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return undefined;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    })
    let rankToReturn:RankLevel;
    for(let rank of ranks){
        if(rank.level>currentLevel) break;
        if(rank.level<=currentLevel){
            rankToReturn=rank;
        }
    }
    return rankToReturn;
}

export async function getPreviousRank(currentLevel : number, guildId : string) : Promise<RankLevel>{
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return undefined;
    ranks.sort((a,b)=>{
        return a.level-b.level;
    })
    let currentRank:RankLevel;
    for(let rank of ranks){
        if(rank.level>currentLevel) break;
        if(rank.level<=currentLevel){
            currentRank=rank;
        }
    }
    let rankToReturn:RankLevel;
    for(let rank of ranks){
        if(rank.level>=currentLevel||rank.level===currentRank.level) break;
        if(rank.level<currentLevel){
            rankToReturn=rank;
        }
    }
    return rankToReturn;
}

export function hexToRGB(hex : string){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

export function blend(a : number, b : number, w : number) : number{
    return (a*w)+(b*(1-w));
}