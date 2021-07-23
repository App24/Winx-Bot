import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { getGuildChannelByID, getGuildChannelFromMention } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase } from "../../Utils";

class LevelChannelCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.minArgs=1;
        this.maxArgs=2;
        this.usage=[new CommandUsage(true, "argument.set", "argument.clear", "argument.list"), new CommandUsage(false, "argument.channel")];
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
        this.subCommands=[new SetSubCommand(), new ClearSubCommand(), new ListSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args);
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);

        const channel=await getGuildChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply(Localisation.getTranslation("error.invalid.channel"));

        serverInfo.levelChannel=channel.id;

        await ServerInfo.set(message.guild.id, serverInfo);
        message.channel.send(Localisation.getTranslation("levelchannel.set", channel));
    }
}

class ClearSubCommand extends SubCommand{
    public constructor(){
        super("clear");
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);

        if(!serverInfo.levelChannel) return message.reply(Localisation.getTranslation("error.empty.levelchannel"));

        serverInfo.levelChannel="";

        await ServerInfo.set(message.guild.id, serverInfo);

        message.channel.send(Localisation.getTranslation("levelchannel.remove"));
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(!serverInfo.levelChannel) return message.reply(Localisation.getTranslation("error.empty.levelchannel"));
        const channel=await getGuildChannelByID(serverInfo.levelChannel, message.guild);
        if(!channel) return message.reply(Localisation.getTranslation("levelchannel.missing.channel"));
        message.channel.send(`${channel}`);
    }
}

export=LevelChannelCommand;