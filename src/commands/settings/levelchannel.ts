import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { getChannelFromMention } from "../../GetterUtilts";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase } from "../../Utils";

class LevelChannelCommand extends Command{
    public constructor(){
        super("Excludes a channel from being used to earn xp");
        this.category=Settings;
        this.minArgs=1;
        this.maxArgs=2;
        this.usage="<set/clear/list> [channel]";
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
        this.subCommands=[new SetSubCommand(), new ClearSubCommand(), new ListSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args, true);
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

        const channel=await getChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply("That is not a valid channel!");

        serverInfo.levelChannel=channel.id;

        await ServerInfo.set(message.guild.id, serverInfo);
        message.channel.send(`Set ${channel} as level channel!`);
    }
}

class ClearSubCommand extends SubCommand{
    public constructor(){
        super("clear");
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);

        if(!serverInfo.levelChannel) return message.reply("There is no level channel!");

        serverInfo.levelChannel="";

        await ServerInfo.set(message.guild.id, serverInfo);

        message.channel.send(`Removed level channel!`);
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(!serverInfo.levelChannel) return message.reply("There is no level channel!");
        message.channel.send(`<#${serverInfo.levelChannel}>`);
    }
}

export=LevelChannelCommand;