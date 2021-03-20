import * as Utils from '../Utils';
import Discord from 'discord.js';
import {parse} from 'discord-command-parser';

const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

module.exports = (client : import("../BotClient"))=>{
    client.on("message", async(message)=>{
        if(!message.content.startsWith(process.env.PREFIX)||message.author.bot)return;

        const parsed=parse(message, process.env.PREFIX, {allowSpaceBeforeCommand: true, ignorePrefixCase: true});
        if(!parsed.success) return;
        const commandName=parsed.command.toLowerCase();
        const args=parsed.arguments;

        const command=client.Commands.get(commandName)||client.Commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(commandName));

        if(!command){
            const customCommands : Array<any>=await Utils.getServerDatabase(client.getDatabase("customCommands"), message.guild.id);
            const customCommand=customCommands.find(cmd=>cmd["commandName"].toLowerCase()===commandName);
            if(customCommand){
                const messages=customCommand["messages"]||[];
                const deleteMessage=customCommand["deleteMessage"]||false;
                const _message=messages[Math.floor(Math.random()*messages.length)];
                if(deleteMessage){
                    if(message.deletable) message.delete();
                }
                await Utils.asyncForEach(_message, async(element)=>{
                    await message.channel.send(element);
                });
            }
            return;
        }

        if(command.guildOnly&&message.channel.type!=="text"){
            return message.reply('I can\'t execute that command inside DMs!');
        }

        if(command.creatorOnly){
            if(message.author.id!==process.env.OWNER_ID) return message.channel.send("Sorry, only the bot creator can use this command!");
        }

        if(command.guildOwnerOnly){
            if(message.author.id!==message.guild.ownerID) return message.channel.send("Sorry, only the server owner can use this command!");
        }

        if(command.paid){
            const userPaid=await Utils.isPatreon(message.author, message.guild, client);
            if(!userPaid){
                return message.reply("This command is a premium feature only. Contact a mod to find out how to gain access to it.");
            }
        }

        if(command.permissions){
            if(!message.member.hasPermission(<Discord.PermissionResolvable>command.permissions)){
                return message.reply(`You do not have permissions to use this command!`);
            }
        }

        if(!cooldowns.has(commandName)){
            cooldowns.set(commandName, new Discord.Collection());
        }

        const now=Date.now();
        const timestamps=cooldowns.get(commandName);
        const cooldownAmount=(command.cooldown||3)*1000;

        if(timestamps.has(message.author.id)){
            const expirationTime=timestamps.get(message.author.id)+cooldownAmount;

            if(now < expirationTime){
                const timeLeft=(expirationTime-now)/1000;
                // return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandName}\` command.`);
                return message.reply(`please wait ${Utils.secondsToTime(timeLeft)} before reusing the \`${commandName}\` command.`);
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
                    reply+=`\nThe proper usage would be: \`${process.env.PREFIX}${commandName} ${command.usage}\``;
                }

                return message.channel.send(reply);
            }
        }

        try{
            await command.onRun(client, message, args);
        }catch(error){
            const Errors=client.getDatabase("errors");
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
}