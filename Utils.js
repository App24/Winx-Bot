const Discord=require('discord.js');
const {join}=require("path");
const fs=require('fs');

module.exports={asyncForEach, getLevelXP, getRoleByID, getChannelByID, getMemberByID, getUserByID, getChannelFromMention, getUserFromMention, getRoleFromMention, clamp, capitalise, loadFiles, genRanHex, hextoRGB, toHexString, getServerDatabase, hasRole, hasModRole, blend, fitText, isClass, isPatreon};

async function asyncForEach(array, callback){
    for(let i = 0; i < array.length; i++){
        var exit=await callback(array[i], i, array);
        if(exit===true) break;
    }
}

function getLevelXP(level){
    return level*2*100+50;
}

function getRoleByID(id, guild){
    if(!id||!guild) return;
    return guild.roles.fetch(id).catch(()=>{return undefined;});
}

function getChannelByID(id, guild){
    if(!id||!guild) return;
    return guild.channels.cache.find(channel=>channel.id===id);
}

function getMemberByID(id, guild){
    if(!id||!guild) return;
    return guild.members.fetch(id).catch(()=>{return undefined;});
}

async function getUserByID(id, client){
    if(!id||!client) return;
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

function getUserFromMention(mention, client){
    if(!client||!mention) return;

    const matches=mention.match(/^<@!?(\d+)>$/);

    if(!matches){
        return getUserByID(mention, client);
    }
    
    return getUserByID(matches[1], client);
}

function getChannelFromMention(mention, guild){
    if(!mention||!guild) return;

    const matches=mention.match(/^<#!?(\d+)>$/);

    if(!matches){
        return getChannelByID(mention, guild);
    }
    
    return getChannelByID(matches[1], guild);
}

function getRoleFromMention(mention, guild){
    if(!guild||!mention) return;

    const matches=mention.match(/^<@&?(\d+)>$/);

    if(!matches){
        return getRoleByID(mention, guild);
    }
    
    return getRoleByID(matches[1], guild);
}

function clamp(value, min, max){
    return Math.max(min, Math.min(value, max));
}

function capitalise(s){
    var splitStr = s.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
}

function loadFiles(directory){
    const files=[];
    const dirs=[];

    try{
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
    }catch(ex){
        console.log(ex);
        return;
    }

    return files;
}

function toHexString(byteArray){
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

function genRanHex(size){
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function hextoRGB(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function blend(a,b,w){
    return (a*w)+(b*(1-w));
}

function hasRole(member, role){
    if(!member||!role) return false;
    return member.roles.cache.find(other=>other.id===role.id) !== undefined;
}

async function hasModRole(member, guild, client){
    if(!member||!guild||!client) return;
    const ModRoles=client.tables["modRoles"];
    const modRoles=await getServerDatabase(ModRoles, guild.id);
    let mod=false;
    await asyncForEach(modRoles, async(roleId)=>{
        const role=await getRoleByID(roleId, guild);
        if(!role) return;
        mod=hasRole(member, role);
        return mod;
    });
    return mod;
}

async function getServerDatabase(database, guildId, defaultValue=[]){
    if(!database||!guildId) return;
    let serverDatabase=await database.get(guildId);
    if(!serverDatabase){
        await database.set(guildId, defaultValue);
        serverDatabase=await database.get(guildId);
    }
    return serverDatabase;
}

function fitText(canvas, text, maxFontSize, maxWidth){
    const ctx=canvas.getContext("2d");
    let fontSize=maxFontSize+10;

    do{
        ctx.font=`${fontSize-=10}px sans-serif`;
    }while(ctx.measureText(text).width>maxWidth&&fontSize>10);

    return [ctx.font, fontSize];
}

function isClass(v) {
    return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

async function isPatreon(user, guild, bot){
    if(!user||!guild||!bot) return false;
    const Paid=bot.tables["paid"];
    const paid=await getServerDatabase(Paid, guild.id);
    const userPaid=paid.find(other=>{return other===user.id;});
    return userPaid!==undefined;
}