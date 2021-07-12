import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetMinLengthCommand extends Command{
    public constructor(){
        super("Set minimum length of message to give XP");
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
            if(len>serverInfo.maxMessageLength) return message.reply("The minimum length can't be higher than the maximum length!");
            serverInfo.minMessageLength=len;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`Minimum message length is now \`${serverInfo.minMessageLength}\``);
        }
        return message.channel.send(`Minimum message length is \`${serverInfo.minMessageLength}\``)
    }
}

export=SetMinLengthCommand;