import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetMaxMessageCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.above.value.0")];
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(args.length){
            const amount=parseInt(args[0]);
            if(isNaN(amount)||amount<=0) return message.reply(Localisation.getTranslation("error.invalid.number"));
            serverInfo.maxMessagePerMinute=amount;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(Localisation.getTranslation("setmaxmessage.set", serverInfo.maxMessagePerMinute));
        }
        return message.channel.send(Localisation.getTranslation("setmaxmessage.get", serverInfo.maxMessagePerMinute));
    }
}

export=SetMaxMessageCommand;