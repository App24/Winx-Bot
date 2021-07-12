import { parse } from "discord-command-parser";
import { Collection } from "discord.js";
import { BotUser } from "../BotClient"
import { OWNER_ID, PREFIX } from "../Constants";
import { getUserByID, getMemberByID } from "../GetterUtilts";
import { CommandAccess, CommandAvailability } from "../structs/Command";
import { DatabaseType } from "../structs/DatabaseTypes";
import { ErrorStruct } from "../structs/databaseTypes/ErrorStruct";
import { genRanHex, isDM, isPatreon, secondsToTime } from "../Utils";

const cooldowns = new Collection<string, Collection<string, number>>();

export=()=>{
    BotUser.on("message", async(message)=>{
        if(!message.content.toLowerCase().startsWith(PREFIX)||message.author.bot) return;

        const parsed=parse(message, PREFIX, {allowSpaceBeforeCommand: true, ignorePrefixCase: true});
        if(!parsed.success) return;
        const commandName=parsed.command.toLowerCase();
        const args=parsed.arguments;

        const command=BotUser.Commands.get(commandName)||BotUser.Commands.find(cmd=>cmd.aliases&&cmd.aliases.includes(commandName));

        if(!command) return;

        if(!isDM(message.channel)&&command.guildIds&&!command.guildIds.includes(message.guild.id)) return;

        if(!command.enabled) return message.reply("This command is disabled!");

        if(command.availability===CommandAvailability.Guild&&(message.channel.type!=="text"&&message.channel.type!=="news")){
            return message.reply("This is a server only command!");
        }else if(command.availability===CommandAvailability.DM&&message.channel.type!=="dm"){
            return message.reply("This is a DM only command!");
        }

        switch(command.access){
            case CommandAccess.Patreon:{
                if(isDM(message.channel)||!(await isPatreon(message.author.id, message.guild.id))){
                    return message.reply("You cannot run this command! It is a patreon only feature! Contact a mod to find out how to gain access to it!");
                }
            }break;
            case CommandAccess.Moderators:{
                if(isDM(message.channel)||!message.member.hasPermission("MANAGE_GUILD")){
                    return message.reply("You cannot run this command!");
                }
            }break;
            case CommandAccess.GuildOwner:{
                if(isDM(message.channel)||message.author.id!==message.guild.ownerID){
                    return message.reply("You cannot run this command!");
                }
            }break;
            case CommandAccess.BotOwner:{
                if(message.author.id!==OWNER_ID){
                    return message.reply("You cannot run this command!");
                }
            }break;
        }

        if(!cooldowns.has(commandName)){
            cooldowns.set(commandName, new Collection());
        }

        const now=Date.now();
        const timestamps=cooldowns.get(commandName);
        const cooldownAmount=(command.cooldown||3)*1000;

        if(timestamps.has(message.author.id)){
            const expirationTime=timestamps.get(message.author.id)+cooldownAmount;

            if(now < expirationTime){
                const timeLeft=(expirationTime-now)/1000;
                return message.reply(`please wait ${secondsToTime(timeLeft)} before reusing the \`${commandName}\` command.`);
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(()=>timestamps.delete(message.author.id), cooldownAmount);

        if(args.length<command.minArgs){
            let reply=`You didn't provide enough arguments`;

            if(command.usage){
                reply+=`\nThe proper usage would be: \`${PREFIX}${commandName} ${command.usage}\``;
            }

            return message.reply(reply);
        }else if(args.length>command.maxArgs){
            let reply=`You provide too many arguments`;

            if(command.usage){
                reply+=`\nThe proper usage would be: \`${PREFIX}${commandName} ${command.usage}\``;
            }

            return message.reply(reply);
        }

        try{
            await command.onRun(message, args);
        }catch(error){
            const Errors=BotUser.getDatabase(DatabaseType.Errors);
            let hex=genRanHex(16);
            let errors=await Errors.get(hex);
            while(errors){
                hex=genRanHex(16);
                errors=await Errors.get(hex);
            }
            console.error(`Code: ${hex}\n${error.stack}`);
            var datetime = new Date();
            const errorObj=new ErrorStruct();
            errorObj.time=datetime.getTime();
            errorObj.error=error.stack;
            await Errors.set(hex, errorObj);
            const owner = await getUserByID(OWNER_ID);
            const ownerMember=await getMemberByID(owner.id, message.guild);
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