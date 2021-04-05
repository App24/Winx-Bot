import { Message } from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';
import {MAX_XP_PER_MESSAGE} from '../../Constants';
import DatabaseType from "../../DatabaseTypes";

class SetXP extends Command{
    constructor(){
        super();
        this.usage="[amount above 0]";
        this.maxArgsLength=1;
        // this.permissions=["MANAGE_GUILD"];
        this.guildOwnerOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set XP per message";
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const ServerInfo=bot.getDatabase(DatabaseType.ServerInfo);
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": MAX_XP_PER_MESSAGE});
        if(args.length){
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            serverInfo["xpPerMessage"]=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            const logChannel=await Utils.getLogChannel(bot, message.guild);
            if(logChannel){
                const embed=Utils.createLogEmbed("Xp Per Message", message.author, xp);
                const botMember=await Utils.getMemberByID(bot.user.id, message.guild);
                if(botMember.roles&&botMember.roles.color)
                    embed.setColor(botMember.roles.color.color);
                logChannel.send(embed);
                const owner = await Utils.getUserByID(process.env.OWNER_ID, bot);
                (await owner.createDM()).send(embed);
            }
            return message.channel.send(`XP per message is now \`${xp}\``);
        }
        
        if(!serverInfo["xpPerMessage"]){
            serverInfo["xpPerMessage"]=MAX_XP_PER_MESSAGE;
        }
        return message.channel.send(`The XP per message is \`${serverInfo["xpPerMessage"]}\``);
    }
}

module.exports=SetXP;