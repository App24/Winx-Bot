import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetMinLengthCommand extends Command{
    public constructor(){
        super();
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
            if(isNaN(len)||len<=0) return message.reply(Localisation.getTranslation("error.invalid.number"));
            if(len>serverInfo.maxMessageLength) return message.reply(Localisation.getTranslation("setminlength.error"));
            serverInfo.minMessageLength=len;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(Localisation.getTranslation("setminlength.set", serverInfo.minMessageLength));
        }
        return message.channel.send(Localisation.getTranslation("setminlength.get", serverInfo.minMessageLength));
    }
}

export=SetMinLengthCommand;