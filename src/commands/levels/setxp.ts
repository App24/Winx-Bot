import { Message } from "discord.js";
import Command from "../../Command";
import * as Utils from '../../Utils';

class SetXP extends Command{
    constructor(){
        super();
        this.usage="[amount above 0]";
        this.modOnly=true;
        this.category=Command.SettingsCategory;
        this.description="Set XP per message";
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const ServerInfo=bot.getDatabase("serverInfo");
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {"xpPerMessage": 5, "messagesPerMinute": 50});
        if(args.length){
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply(`\`${args[0]}\` does not seem to be a valid number!`);
            serverInfo["xpPerMessage"]=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`XP per message is now \`${xp}\``);
        }
    
        return message.channel.send(`The XP per message is \`${serverInfo["xpPerMessage"]}\``);
    }
}

module.exports=SetXP;