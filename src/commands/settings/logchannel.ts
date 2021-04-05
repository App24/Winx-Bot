import Discord from "discord.js";
import Command from "../../Command";
import DatabaseType from "../../DatabaseTypes";
import * as Utils from '../../Utils';

class LogChannel extends Command{
    constructor(){
        super();
        this.permissions=["MANAGE_GUILD"];
        this.usage="[channel/delete]";
        this.description="Sets the Log Channel!";
        this.category=Command.SettingsCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const ServerInfo=bot.getDatabase(DatabaseType.ServerInfo);
        const serverInfo=await Utils.getServerDatabase(ServerInfo, message.guild.id, {});
        if(!args[0]){
            if(serverInfo["logChannel"]){
                const channel=await Utils.getTextChannelByID(serverInfo["logChannel"], message.guild);
                return message.channel.send(`Log Channel: ${channel}`);
            }else{
                return message.reply("There is no log channel set for this server!");
            }
        }else if(args[0].toLowerCase()==="delete"){
            if(serverInfo["logChannel"]){
                delete serverInfo["logChannel"];
                await ServerInfo.set(message.guild.id, serverInfo);
                return message.channel.send(`Removed log channel!`);
            }else{
                return message.reply("There is no log channel set for this server!");
            }
        }else{
            const channel=await Utils.getTextChannelFromMention(args[0], message.guild);
            if(!channel) return message.reply("This is not a valid channel!");
            serverInfo["logChannel"]=channel.id;
            await ServerInfo.set(message.guild.id, serverInfo);
            message.channel.send(`Set log channel to ${channel}`);
        }
    }
}

module.exports=LogChannel;