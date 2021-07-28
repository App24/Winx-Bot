import {join} from 'path';
import fs from 'fs';
import Keyv from './keyv-index';
import { Channel, Guild, GuildMember, Message, MessageAttachment, NewsChannel, TextChannel } from 'discord.js';
import { BotUser } from './BotClient';
import { DatabaseType } from './structs/DatabaseTypes';
import { PatreonInfo } from './structs/databaseTypes/PatreonInfo';
import { Canvas, createCanvas } from 'canvas';
import { getMemberByID, getUserByID } from './GetterUtils';
import { RankLevel } from './structs/databaseTypes/RankLevel';
import { UserLevel } from './structs/databaseTypes/UserLevel';
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER, OWNER_ID } from './Constants';
import { ErrorStruct } from './structs/databaseTypes/ErrorStruct';
import { Localisation } from './localisation';

/**
 * 
 * @param array list of items to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncForEach<U>(array:U[], callbackFn: (value: U, index: number, array: readonly U[])=>Promise<any>|any) {
    for(let i =0; i < array.length; i++){
        let exit=await callbackFn(array[i], i, array);
        if(exit===true)break;
    }
}

/**
 * 
 * @param map map to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncMapForEach<U,T>(map:Map<U,T>, callbackFn: (key:U, value:T, index:number, map:ReadonlyMap<U,T>)=>Promise<any>|any) {
    const keys=Array.from(map.keys());
    const values=Array.from(map.values());
    for(let i =0; i < map.size; i++){
        let exit=await callbackFn(keys[i], values[i], i, map);
        if(exit===true)break;
    }
}

/**
 * Get all files in a folder and its subfolders
 * @param directory the parent directory to get all files from
 * @returns all files found in all sub-directories
 */
export function loadFiles(directory : string){
    const files:string[]=[];
    const dirs:string[]=[];

    try{
        if(fs.existsSync(directory)){
            let dirContent=fs.readdirSync(directory);

            dirContent.forEach(file=>{
                const fullPath=join(directory, file);

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
        console.error(ex);
        return;
    }

    return files;
}

/**
 * 
 * @param level 
 * @returns Amount of xp this level needs
 */
export function getLevelXP(level : number){
    return Math.abs(level)*2*100+50;
}

/**
 * 
 * @param value 
 * @param min minimum value that the value can be
 * @param max maximum value that the value can be
 * @returns clamped valued
 */
export function clamp(value : number, min : number, max : number){
    return Math.max(min, Math.min(value, max));
}

/**
 * 
 * @param size the length of the string
 * @returns hex string
 */
export function genRanHex(size : number){
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function toHexString(byteArray : number[]){
    return Array.from(byteArray, function(byte){
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

/**
 * 
 * @param database Database to get the data from
 * @param guildId Guild ID of the server
 * @param defaultValue The default value to set if there isn't any
 * @returns Data stored in database
 */
export async function getServerDatabase<U>(database : Keyv, guildId : string, defaultValue : any =[]):Promise<U>{
    let serverDatabase=await database.get(guildId);
    if(!serverDatabase){
        await database.set(guildId, defaultValue);
        serverDatabase=await database.get(guildId);
    }
    return serverDatabase;
}

/**
 * 
 * @param s String to capitalise
 * @returns Capitalised string
 */
export function capitalise(s : string){
    var splitStr = s.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

/**
 * 
 * @param time Time in seconds
 * @returns stringified time
 */
export function secondsToTime(time : number){
    let hours = Math.floor(time/3600);
    let minutes = Math.floor(time%3600/60);
    let seconds = Math.floor(time%3600%60);

    const times=[];
    if(hours>0) times.push(hours.toFixed(0)+" hour(s)");
    if(minutes>0) times.push(minutes.toFixed(0)+" minute(s)");
    if(seconds>0||!times.length) times.push(seconds.toFixed(0)+" second(s)");

    return times.join(" and ");
}

/**
 * 
 * @param channel 
 * @returns True if the chanell is DM, false if not
 */
export function isDM(channel : Channel){
    return channel.type==="dm";
}

export function getBotMember(guild : Guild){
    return getMemberByID(BotUser.user.id, guild);
}

/**
 * 
 * @param guild 
 * @returns Color of the role color of bot as a number
 */
export async function getBotRoleColor(guild : Guild){
    const defaultcolor=5793266;
    if(!guild) return defaultcolor;
    const member=await getBotMember(guild);
    if(!member) return defaultcolor;
    if(!member.roles) return defaultcolor;
    if(!member.roles.color) return defaultcolor;
    return member.roles.color.color;
}

export function dateToString(date : Date, format : string){
    function pad(num:number, size:number) {
        let numStr = num.toString();
        while (numStr.length < size) numStr = "0" + numStr;
        return numStr;
    }

    return format.replace(/{\w+}/g, (match)=>{
        match=match.replace(/({|})/g, "");
        switch(match){
            case "dd":
                return pad(date.getDate(), 2);
            case "MM":
                return pad(date.getMonth()+1, 2);
            case "YYYY":
                return date.getFullYear().toString();
            case "HH":
                return pad(date.getHours(), 2);
            case "mm":
                return pad(date.getMinutes(), 2)
            case "ss":
                return pad(date.getSeconds(), 2)
        }
        return match;
    })
}

/**
 * 
 * @param userId The ID of the user
 * @param guildId The ID of the guild
 * @returns True if the user is a patreon, false if the user is not a patreon
 */
export async function isPatreon(userId : string, guildId : string){
    if(!userId||!guildId) return false;
    const Patreon=BotUser.getDatabase(DatabaseType.Paid);
    const patreon:PatreonInfo[]=await Patreon.get(guildId);
    if(!patreon||!patreon.length) return false;
    return patreon.find(user=>user.userId===userId)!==undefined;
}

/**
 * 
 * @param canvas Canvas to convert
 * @param fileName Name of file to send to discord
 * @returns Message Attachment
 */
export function canvasToMessageAttachment(canvas : Canvas, fileName:string="color"){
    return new MessageAttachment(canvas.toBuffer(), `${fileName}.png`);
}

/**
 * Fill a canvas with a specific color
 * @param color hex string of color
 * @param width width of the canvas
 * @param height height of the canvas
 * @returns A Canvas with the color
 */
export function canvasColor(color : string, width : number=700, height : number=320){
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle="#"+color;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    return canvas;
}

/**
 * Check if a string is a valid hex color
 * @param str String to compare
 * @returns True if it is a hex color, false if it isn't
 */
export function isHexColor(str : string){
    return new RegExp(/[a-f\d]{6}/g).test(str);
}


export async function getNextRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
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

export async function getCurrentRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
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

export async function getPreviousRank(currentLevel : number, guildId : string){
    const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
    const ranks:RankLevel[]=await getServerDatabase(Ranks, guildId);
    if(!ranks||!ranks.length) return;
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

/**
 * 
 * @param a Initial Value
 * @param b End Value
 * @param w Amount to blend
 * @returns Value between `a` and `b`
 */
export function blend(a : number, b : number, w : number){
    return (a*w)+(b*(1-w));
}

export async function getAllMessages(channel : TextChannel|NewsChannel){
    const messages:Message[]=[];
    let msgs=await channel.messages.fetch().then(promise=>promise.array());
    let lastMessage;
    while(msgs.length){
        messages.push(...msgs);
        lastMessage=msgs[msgs.length-1].id;
        msgs=await channel.messages.fetch({before: lastMessage}).then(promise=>promise.array());
    }
    return messages;
}

export async function getLeaderboardMembers(guild : Guild){
    const Levels=BotUser.getDatabase(DatabaseType.Levels);
    const levels:UserLevel[]=await getServerDatabase(Levels, guild.id)
    levels.sort((a,b)=>{
        if(a.level===b.level){
            return b.xp-a.xp;
        }
        return b.level-a.level;
    });
    const leaderboardLevels:{userLevel: UserLevel, member: GuildMember}[]=[];
    let userIndex=0;
    await asyncForEach(levels, async(level : UserLevel)=>{
        const member=await getMemberByID(level.userId, guild);
        if(member){
            leaderboardLevels.push({userLevel: level, member});
            userIndex++;
            if(userIndex>=15)
                return true;
        }
    });
    return leaderboardLevels;
}

export function formatString(str : string, ...args){
    return str.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

export function backupDatabases(){
    if(!fs.existsSync(DATABASE_BACKUP_FOLDER)){
        fs.mkdirSync(DATABASE_BACKUP_FOLDER);
    }

    const values = Object.values(DatabaseType);
    values.forEach((value, index)=>{
        fs.copyFileSync(`${DATABASE_FOLDER}/${value}.sqlite`, `${DATABASE_BACKUP_FOLDER}/${value}.sqlite`);
    });
}

export async function reportError(error, message : Message){
    const Errors=BotUser.getDatabase(DatabaseType.Errors);
    let hex=genRanHex(16);
    let errors=await Errors.get(hex);
    while(errors){
        hex=genRanHex(16);
        errors=await Errors.get(hex);
    }
    console.error(`Code: ${hex}\n${error}`);
    const errorObj=new ErrorStruct();
    errorObj.time=new Date().getTime();
    errorObj.error=error;
    await Errors.set(hex, errorObj);
    const owner = await getUserByID(OWNER_ID);
    const ownerMember=await getMemberByID(owner.id, message.guild);
    let text=`Error: \`${hex}\``;
    if(ownerMember){
        text+=`\nServer: ${message.guild.name}`;
        text+=`\nURL: ${message.url}`;
    }
    (await owner.createDM()).send(text);
    message.reply(Localisation.getTranslation("error.execution"));
}