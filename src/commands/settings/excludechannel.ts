import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getChannelByID, getChannelFromMention } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getServerDatabase } from "../../Utils";

class ExcludeChannelCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.minArgs=1;
        this.maxArgs=2;
        this.usage="<add/remove/list> [channel]";
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
        this.subCommands=[new AddSubCommand(), new RemoveSubCommand(), new ListSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args);
    }
}

class AddSubCommand extends SubCommand{
    public constructor(){
        super("add");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        
        if(!serverInfo.excludeChannels) serverInfo.excludeChannels=[];

        const channel=await getChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply(Localisation.getTranslation("error.invalid.channel"));
        
        if(serverInfo.excludeChannels.find(c=>c===channel.id)) return message.reply(Localisation.getTranslation("excludechannel.channel.already"));

        serverInfo.excludeChannels.push(channel.id);

        await ServerInfo.set(message.guild.id, serverInfo);
        message.channel.send(Localisation.getTranslation("excludechannel.add", channel));
    }
}

class RemoveSubCommand extends SubCommand{
    public constructor(){
        super("remove");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);

        if(!serverInfo.excludeChannels||!serverInfo.excludeChannels.length) return message.reply(Localisation.getTranslation("error.empty.excludedchannels"));

        const channel=await getChannelFromMention(args[0], message.guild);
        if(!channel) return message.reply(Localisation.getTranslation("error.invalid.channel"));

        if(!serverInfo.excludeChannels.find(c=>c===channel.id)) return message.reply(Localisation.getTranslation("excludechannel.channel.not"));

        const index=serverInfo.excludeChannels.findIndex(c=>c===channel.id);
        if(index>=0) serverInfo.excludeChannels.splice(index, 1);

        await ServerInfo.set(message.guild.id, serverInfo);
        message.channel.send(Localisation.getTranslation("excludechannel.remove", channel));
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, message.guild.id, DEFAULT_SERVER_INFO);
        if(!serverInfo.excludeChannels||!serverInfo.excludeChannels.length) return message.reply(Localisation.getTranslation("error.empty.excludedchannels"));
        const data=[];
        await asyncForEach(serverInfo.excludeChannels, async(excludedChannel:string)=>{
            const channel=await getChannelByID(excludedChannel, message.guild);
            if(channel){
                data.push(channel);
            }
        });
        const embed=new MessageEmbed();
        embed.setDescription(data);
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed);
    }
}

export=ExcludeChannelCommand;