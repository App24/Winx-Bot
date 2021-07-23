import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetMinLengthCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.above.value.0")];
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guild.id, DEFAULT_SERVER_INFO);
        if(cmdArgs.args.length){
            const len=parseInt(cmdArgs.args[0]);
            if(isNaN(len)||len<=0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.number"));
            if(len>serverInfo.maxMessageLength) return cmdArgs.message.reply(Localisation.getTranslation("setminlength.error"));
            serverInfo.minMessageLength=len;
            await ServerInfo.set(cmdArgs.guild.id, serverInfo);
            return cmdArgs.channel.send(Localisation.getTranslation("setminlength.set", serverInfo.minMessageLength));
        }
        return cmdArgs.channel.send(Localisation.getTranslation("setminlength.get", serverInfo.minMessageLength));
    }
}

export=SetMinLengthCommand;