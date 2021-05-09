import { Message } from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';
import {MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH} from '../../Constants';
import DatabaseType from "../../DatabaseTypes";

class SetMaxLength extends Command{
    constructor(){
        super();
        this.usage="[amount above 0]";
        this.maxArgsLength=1;
        // this.permissions=["MANAGE_GUILD"];
        this.guildOwnerOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set maximum length of message to give XP";
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const ServerInfo=bot.getDatabase(DatabaseType.ServerInfo);
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {});
        if(args.length){
            const messageLength=parseInt(args[0]);
            if(isNaN(messageLength)||messageLength<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            if(!serverInfo["minMessageLength"]){
                serverInfo["minMessageLength"]=MIN_MESSAGE_LENGTH;
            }
            if(messageLength<serverInfo["minMessageLength"]) return message.reply("The maximum length can't be lower than the minimum length!");
            serverInfo["maxMessageLength"]=messageLength;
            await ServerInfo.set(message.guild.id, serverInfo);
            const logChannel=await Utils.getLogChannel(bot, message.guild);
            if(logChannel){
                const embed=Utils.createLogEmbed("Maximum message length", message.author, messageLength);
                const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                logChannel.send(embed);
            }
            return message.channel.send(`Maximum message length is now \`${messageLength}\``);
        }
        
        if(!serverInfo["maxMessageLength"]){
            serverInfo["maxMessageLength"]=MAX_MESSAGE_LENGTH;
        }
        return message.channel.send(`The maximum message length is \`${serverInfo["maxMessageLength"]}\``);
    }
}

module.exports=SetMaxLength;