import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetMaxLengthCommand extends Command{
    public constructor(){
        super("Set maximum length of message to give XP");
        this.maxArgs=1;
        this.usage="[amount above 0]";
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(args.length){
            const len=parseInt(args[0]);
            if(isNaN(len)||len<=0) return message.reply("That is not a valid number!");
            if(len<serverInfo.minMessageLength) return message.reply("The maximum length can't be lower than the minimum length!");
            serverInfo.maxMessageLength=len;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`Maximum message length is now \`${serverInfo.maxMessageLength}\``);
        }
        return message.channel.send(`Maximum message length is \`${serverInfo.maxMessageLength}\``)
    }
}

export=SetMaxLengthCommand;