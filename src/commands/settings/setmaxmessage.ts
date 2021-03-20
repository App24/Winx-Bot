import { Message } from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';
import {MAX_MESSAGE_PER_MINUTE} from '../../Constants';

class SetMaxMessage extends Command{
    constructor(){
        super();
        this.usage="[amount above 0]";
        // this.permissions=["MANAGE_GUILD"];
        this.serverOwnerOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set maximum of messages per minute";
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const ServerInfo=bot.getDatabase("serverInfo");
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"messagesPerMinute": MAX_MESSAGE_PER_MINUTE});
        if(args.length){
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            serverInfo["messagesPerMinute"]=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            const logChannel=await Utils.getLogChannel(bot, message.guild);
            if(logChannel){
                const embed=Utils.createLogEmbed("Max messages per minute", message.author, xp);
                const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                logChannel.send(embed);
                const owner = await Utils.getUserByID(process.env.OWNER_ID, bot);
                (await owner.createDM()).send(embed);
            }
            return message.channel.send(`Max messages per minute is now \`${xp}\``);
        }
        
        if(!serverInfo["messagesPerMinute"]){
            serverInfo["messagesPerMinute"]=MAX_MESSAGE_PER_MINUTE;
        }
        return message.channel.send(`The max messages per minute is \`${serverInfo["messagesPerMinute"]}\``);
    }
}

module.exports=SetMaxMessage;