import { Message } from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';
import {MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH} from '../../Constants';

class SetMinLength extends Command{
    constructor(){
        super();
        this.usage="[amount above 0]";
        // this.permissions=["MANAGE_GUILD"];
        this.guildOwnerOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set minimum length of message to give XP";
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const ServerInfo=bot.getDatabase("serverInfo");
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {});
        if(args.length){
            const messageLength=parseInt(args[0]);
            if(isNaN(messageLength)||messageLength<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            if(!serverInfo["maxMessageLength"]){
                serverInfo["maxMessageLength"]=MAX_MESSAGE_LENGTH;
            }
            if(messageLength>serverInfo["maxMessageLength"]) return message.reply("The minimum length can't be higher than the maximum length!");
            serverInfo["minMessageLength"]=messageLength;
            await ServerInfo.set(message.guild.id, serverInfo);
            const logChannel=await Utils.getLogChannel(bot, message.guild);
            if(logChannel){
                const embed=Utils.createLogEmbed("Minimum message length", message.author, messageLength);
                const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                logChannel.send(embed);
                const owner = await Utils.getUserByID(process.env.OWNER_ID, bot);
                (await owner.createDM()).send(embed);
            }
            return message.channel.send(`Minimum message length is now \`${messageLength}\``);
        }
        
        if(!serverInfo["minMessageLength"]){
            serverInfo["minMessageLength"]=MIN_MESSAGE_LENGTH;
        }
        return message.channel.send(`The minimum message length is \`${serverInfo["minMessageLength"]}\``);
    }
}

module.exports=SetMinLength;