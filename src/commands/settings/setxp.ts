import { MessageActionRow, MessageButton } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandUsage, CommandAccess, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetXPCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.above.value.0")];
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guild.id, DEFAULT_SERVER_INFO);
        if(cmdArgs.args.length){
            const xp=parseInt(cmdArgs.args[0]);
            if(isNaN(xp)||xp<=0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.xp"));
            serverInfo.maxXpPerMessage=xp;
            await ServerInfo.set(cmdArgs.guild.id, serverInfo);
            return cmdArgs.message.reply(Localisation.getTranslation("setxp.set", serverInfo.maxXpPerMessage));
        }
        return cmdArgs.message.reply(Localisation.getTranslation("setxp.get", serverInfo.maxXpPerMessage));
    }
}

export=SetXPCommand;