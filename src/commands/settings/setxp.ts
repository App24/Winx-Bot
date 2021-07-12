import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../Utils";

class SetXPCommand extends Command{
    public constructor(){
        super("Set XP per message");
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
            const xp=parseInt(args[0]);
            if(isNaN(xp)||xp<=0) return message.reply("That is not a valid number!");
            serverInfo.maxXpPerMessage=xp;
            await ServerInfo.set(message.guild.id, serverInfo);
            return message.channel.send(`XP per message is now \`${serverInfo.maxXpPerMessage}\``);
        }
        return message.channel.send(`XP per message is \`${serverInfo.maxXpPerMessage}\``)
    }
}

export=SetXPCommand;