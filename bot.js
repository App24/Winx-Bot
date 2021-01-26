const Discord=require('discord.js');
const parser=require('discord-command-parser');
const fs=require('fs');
const Keyv=require('keyv');
const {join}=require("path");
const Utils=require('./Utils');

const intents=new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client=new Discord.Client({ws:{intents:intents}});
const cooldowns = new Discord.Collection();

client.commands=new Discord.Collection();

var dir = 'databases';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const Levels = new Keyv(`sqlite://${dir}/levels.sqlite`);
const Ranks = new Keyv(`sqlite://${dir}/ranks.sqlite`);
const Excludes=new Keyv(`sqlite://${dir}/excludes.sqlite`);
const ServerInfo=new Keyv(`sqlite://${dir}/serverInfo.sqlite`);

const tables={};
tables["levels"]=Levels;
tables["ranks"]=Ranks;
tables["excludes"]=Excludes;
tables["serverInfo"]=ServerInfo;

client.tables=tables;

function loadCommands(){
    const files=Utils.iterateDir("./commands");
    for(const file of files){
        if(file.endsWith(".js")){
            const command=require(`./${file}`);

            if(!command.deprecated){
                client.commands.set(command.name, command);
                console.log(`Loaded Command: ${command.name}`);
            }
        }
    }
}

loadCommands();

client.once("shardReady", async(shardId)=>{
    console.log(`Shard ${shardId} is ready!`);
});

const capXp=new Discord.Collection();

client.on('guildBanAdd', async(guild, user)=>{
    let levels=await Levels.get(guild.id);
    if(!levels){
        return;
    }
    let userInfo=await levels.find(_user=>_user["id"]===user.id);
    if(!userInfo){
        return;
    }
    delete levels[userInfo];
    Levels.set(guild.id, levels);
});

client.on("message", async(message)=>{
    if(!message.content.startsWith(process.env.PREFIX)||message.author.bot||message.channel.type==='dm'){
        if(message.author.bot||message.channel.type==='dm') return;
        const excluded=await Excludes.get(message.guild.id);
        if(excluded){
            const channelExcluded=await excluded.find(u=>u["id"]===message.channel.id);
            if(channelExcluded){
                return;
            }
        }
        let serverInfo=await ServerInfo.get(message.guild.id);
        if(!serverInfo){
            await ServerInfo.set(message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
            serverInfo=await ServerInfo.get(message.guild.id);
        }
        const xpPerMessage=serverInfo["xpPerMessage"];
        const messagesPerMinute=serverInfo["messagesPerMinute"];
        
        if(!capXp.has(message.guild.id)){
            capXp.set(message.guild.id, []);
        }
        const data=capXp.get(message.guild.id);
        if(!data.find(other=>{return other["id"]===message.author.id})){
            const _=capXp.get(message.guild.id);
            _.push({"id": message.author.id, "cap":[]});
            capXp.set(message.guild.id, _);
        }
        const xpData=capXp.get(message.guild.id).find(other=>{return other["id"]===message.author.id})["cap"];
        if(xpData.length>=messagesPerMinute) return;
        const newData=Date.now();
        xpData.push(newData);
        setTimeout(()=>{
            const index=xpData.indexOf(newData);
            xpData.splice(index, 1);
        }, 60*1000);

        
        let levels=await Levels.get(message.guild.id);
        if(!levels){
            await Levels.set(message.guild.id, []);
            levels=await Levels.get(message.guild.id);
        }
        let userInfo=await levels.find(user=>user["id"]===message.author.id);
        if(!userInfo){
            await levels.push({"id":message.author.id, "xp":0, "level":0});
            userInfo=await levels.find(user=>user["id"]===message.author.id);
        }
        const index=levels.indexOf(userInfo);
        userInfo["xp"]+=xpPerMessage;
        while(userInfo["xp"]>=Utils.getXPLevel(userInfo["level"])){
            userInfo["xp"]-=Utils.getXPLevel(userInfo["level"]);
            userInfo["level"]++;
            let ranks=await Ranks.get(message.guild.id);
            if(!ranks){
                return;
            }
            let rankLevel=await ranks.find(u=>u["level"]===userInfo["level"]);
            if(rankLevel){
                const user=message.guild.member(message.author);
                if(!user){
                    return message.channel.send("error somewhere idk 🤷‍♀️🤷‍♀️");
                }
                const rank=message.guild.roles.cache.get(rankLevel["role"]);
                user.roles.add(rank);
                message.channel.send(`${message.author} has earned a new transformation called ${rank.name}. amazing work!`);
            }
            message.channel.send(`${message.author} has leveled up to level ${userInfo["level"]}`);
        }
        levels[index]=userInfo;
        Levels.set(message.guild.id, levels);
        return;
    }

    const parsed=parser.parse(message, process.env.PREFIX);
    if(!parsed.success) return;
    const commandName=parsed.command.toLowerCase();
    const args=parsed.arguments;

    const command=client.commands.get(commandName)||client.commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(commandName));

    if(!command) return;

    if(command.permissions){
        if(!message.member.hasPermission(command.permissions)) return message.reply(`You do not have permissions to use this command!`);
    }

    if(message.channel.type!=='text'){
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now=Date.now();
    const timestamps=cooldowns.get(command.name);
    const cooldownAmount=(command.cooldown||3)*1000;

    if(timestamps.has(message.author.id)){
        const expirationTime=timestamps.get(message.author.id)+cooldownAmount;

        if(now < expirationTime){
            const timeLeft=(expirationTime-now)/1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(()=>timestamps.delete(message.author.id), cooldownAmount);

    if(command.args&&!args.length){
        let reply=`You didn't provide any arguments, ${message.author}`;

        if(command.usage){
            reply+=`\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if(command.ownerOnly){
        if(message.author.id!==process.env.OWNER_ID) return message.channel.send("Sorry, only the owner can use this command!");
    }

    try{
        await command.run(client, message, args);
    }catch(error){
        console.error(error);
        message.reply("There was a problem executing that command!");
    }
});

client.login(process.env.TOKEN);