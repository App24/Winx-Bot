const Discord=require('discord.js');
const parser=require('discord-command-parser');
const fs=require('fs');
const Utils=require('./Utils');
const Keyv=require("./keyv-index");

const intents=new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client=new Discord.Client({ws:{intents:intents}});
const cooldowns = new Discord.Collection();

client.commands=new Discord.Collection();

var dir = 'databases';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

function loadCommands(){
    const files=Utils.loadFiles("./commands");
    for(const file of files){
        if(file.endsWith(".js")){
            const commandRequire=require(`./${file}`);
            if(Utils.isClass(commandRequire)){
                const command=new commandRequire();
                if(!command.deprecated){
                    client.commands.set(command.name, command);
                    console.log(`Loaded Command: ${command.name}`);
                }
            }
        }
    }
}

loadCommands();

const Levels = new Keyv(`sqlite://${dir}/levels.sqlite`);
const Ranks = new Keyv(`sqlite://${dir}/ranks.sqlite`);
const Excludes=new Keyv(`sqlite://${dir}/excludes.sqlite`);
const ServerInfo=new Keyv(`sqlite://${dir}/serverInfo.sqlite`);
const UserSettings=new Keyv(`sqlite://${dir}/userSettings.sqlite`);
const Errors=new Keyv(`sqlite://${dir}/errors.sqlite`);
const Paid=new Keyv(`sqlite://${dir}/paid.sqlite`);
const ModRoles=new Keyv(`sqlite://${dir}/modRoles.sqlite`);
const Suggestions=new Keyv(`sqlite://${dir}/suggestions.sqlite`);
const CustomCommands=new Keyv(`sqlite://${dir}/customCommands.sqlite`);

const tables={};
tables["levels"]=Levels;
tables["ranks"]=Ranks;
tables["excludes"]=Excludes;
tables["serverInfo"]=ServerInfo;
tables["userSettings"]=UserSettings;
tables["errors"]=Errors;
tables["paid"]=Paid;
tables["modRoles"]=ModRoles;
tables["suggestions"]=Suggestions;
tables["customCommands"]=CustomCommands;

client.tables=tables;

client.on("guildMemberAdd", async(member)=>{
    const levels=await Levels.get(member.guild.id);
    const ranks=await Ranks.get(member.guild.id);
    if(!levels||!ranks) return;
    const user=await levels.find(u=>u["id"]===member.user.id);
    if(user){
        await Utils.asyncForEach(ranks, async(rank) => {
            if(user["level"]>=rank["level"]){
                const role=await Utils.getRoleByID(rank["role"], member.guild);
                if(!role) return;
                member.roles.add(role);
            }
        });
    }
});

client.once("shardReady", async(shardId)=>{
    console.log(`Shard ${shardId} is ready!`);
});

client.on("ready", ()=>{
    let i=0;
    setInterval(() => {
        switch (i%3) {
            case 0:
                client.user.setActivity(`${process.env.PREFIX}help for help!`);
                break;
            case 1:
                client.user.setActivity(`${process.env.PREFIX}suggestion for your suggestion!`);
                break;
            case 2:
                const promises = [
                    client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)'),
                ];
                Promise.all(promises).then(results=>{
                    const numUsers=results[0].reduce((acc, memberCount) => acc + memberCount, 0);
                    client.user.setActivity(`${numUsers} users earning their transformations!`);
    
                });
                break;
        }
        i++;
    }, 1000*10);
});

const capXp=new Discord.Collection();

client.on("message", async(message)=>{
    if(!message.content.startsWith(process.env.PREFIX)||message.author.bot){
        if(message.author.bot||message.content.length<3) return;
        const excluded=await Excludes.get(message.guild.id);
        if(excluded){
            const channelExcluded=await excluded.find(u=>u["id"]===message.channel.id);
            if(channelExcluded){
                return;
            }
        }
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        if(!serverInfo["xpPerMessage"]){
            serverInfo["xpPerMessage"]=5;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        if(!serverInfo["messagesPerMinute"]){
            serverInfo["messagesPerMinute"]=50;
            await ServerInfo.set(message.guild.id, serverInfo);
        }
        const xpPerMessage=serverInfo["xpPerMessage"];
        const messagesPerMinute=serverInfo["messagesPerMinute"];
        
        if(!capXp.has(message.guild.id)){
            capXp.set(message.guild.id, []);
        }
        const data=capXp.get(message.guild.id);
        if(!data.find(other=>{return other["id"]===message.author.id;})){
            const _=capXp.get(message.guild.id);
            _.push({"id": message.author.id, "cap":[]});
            capXp.set(message.guild.id, _);
        }
        const xpData=capXp.get(message.guild.id).find(other=>{return other["id"]===message.author.id;})["cap"];
        if(xpData.length>=messagesPerMinute) return;
        const newDate=Date.now();
        xpData.push(newDate);
        setTimeout(()=>{
            const index=xpData.indexOf(newDate);
            xpData.splice(index, 1);
        }, 60*1000);

        const levels=await Utils.getServerDatabase(Levels, message.guild.id);
        let userInfo=await levels.find(user=>user["id"]===message.author.id);
        if(!userInfo){
            await levels.push({"id":message.author.id, "xp":0, "level":0});
            userInfo=await levels.find(user=>user["id"]===message.author.id);
        }
        const index=levels.indexOf(userInfo);
        userInfo["xp"]+=xpPerMessage;
        let levelChannel=message.channel;
        if(serverInfo["levelChannel"]){
            const channel=await Utils.getChannelByID(serverInfo["levelChannel"], message.guild);
            if(channel) levelChannel=channel;
        }
        while(userInfo["xp"]>=Utils.getLevelXP(userInfo["level"])){
            userInfo["xp"]-=Utils.getLevelXP(userInfo["level"]);
            userInfo["level"]++;
            let ranks=await Ranks.get(message.guild.id);
            if(!ranks){
                return;
            }
            let rankLevel=await ranks.find(u=>u["level"]===userInfo["level"]);
            if(rankLevel){
                let gifs=rankLevel["gifs"];
                const user=await Utils.getMemberByID(message.author.id, message.guild);
                if(!user){
                    return message.channel.send("error somewhere idk 🤷‍♀️🤷‍♀️");
                }
                const rank=await Utils.getRoleByID(rankLevel["role"], message.guild);
                user.roles.add(rank);
                levelChannel.send(`${message.author} has earned a new transformation called ${Utils.capitalize(rank.name)}. Amazing work!`);
                if(gifs&&gifs.length){
                    levelChannel.send(gifs[Math.floor(Math.random()*gifs.length)]);
                }
            }
            levelChannel.send(`${message.author} has leveled up to level ${userInfo["level"]}!`);
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

    if(!command){
        let customCommands=await CustomCommands.get(message.guild.id);
        if(!customCommands){
            await CustomCommands.set(message.guild.id, []);
            customCommands=await CustomCommands.get(message.guild.id);
        }
        const customCommand=customCommands.find(cmd=>cmd["name"].toLowerCase()===commandName);
        if(customCommand){
            return message.channel.send(customCommand["messages"][Math.floor(Math.random()*customCommand["messages"].length)]);
        }else{
            return;
        }
    }

    if(command.guildOnly&&message.channel.type!=='text'){
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if(command.ownerOnly){
        if(message.author.id!==process.env.OWNER_ID) return message.channel.send("Sorry, only the owner can use this command!");
    }

    if(command.paid){
        const userPaid=await Utils.isPatreon(message.author, message.guild, client);
        if(!userPaid){
            return message.reply("This command is a premium feature only. Contact a mod to find out how to gain access to it.");
        }
    }

    if(command.permissions){
        if(!message.member.hasPermission(command.permissions)){
            return message.reply(`You do not have permissions to use this command!`);
        }
    }

    if(command.modOnly){
        const member=await Utils.getMemberByID(message.author.id, message.guild);
        const modrole=await Utils.hasModRole(member, message.guild, client);
        if(!modrole){
            return message.reply(`This is a mod only command!`);
        }
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
			if(message.author.id!==process.env.OWNER_ID){
				const timeLeft=(expirationTime-now)/1000;
				return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
			}
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(()=>timestamps.delete(message.author.id), cooldownAmount);

    if(command.args){
        let minArgsLength=1;
        if(command.minArgsLength) minArgsLength=command.minArgsLength;
        if(args.length<minArgsLength){
            let reply=`You didn't provide enough arguments, ${message.author}`;

            if(command.usage){
                reply+=`\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
        }
    }

    try{
        await command.onRun(client, message, args);
    }catch(error){
        let hex=Utils.genRanHex(16);
        let errors=await Errors.get(hex);
        while(errors){
            hex=Utils.genRanHex(16);
            errors=await Errors.get(hex);
        }
        console.error(`Code: ${hex}\n${error.stack}`);
        var datetime = new Date();
        const obj={"time": datetime.toISOString().slice(0,10), "error":error.stack};
        const objString=JSON.stringify(obj);
        await Errors.set(hex, objString);
        const owner = await Utils.getUserByID(process.env.OWNER_ID, client);
        const ownerMember=await Utils.getMemberByID(owner.id, message.guild);
        let text=`Error: \`${hex}\``;
        if(ownerMember){
            text+=`\nServer: ${message.guild.name}`;
            text+=`\nURL: ${message.url}`;
        }
        (await owner.createDM()).send(text);
        message.reply(`There was a problem executing that command!`);
    }
});

client.login(process.env.TOKEN);