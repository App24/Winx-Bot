import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getMemberFromMention, getMemberByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { PatreonInfo } from "../../structs/databaseTypes/PatreonInfo";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getServerDatabase, getStringTime } from "../../Utils";

class PatreonCommand extends Command{
    public constructor(){
        super();
        this.category=Moderator;
        this.usage=[new CommandUsage(true, "argument.add", "argument.remove", "argument.list"), new CommandUsage(false, "argument.user")];
        this.minArgs=1;
        this.maxArgs=2;
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
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, message.guild.id);

        const member=await getMemberFromMention(args[0], message.guild);
        if(!member) return message.reply(Localisation.getTranslation("error.invalid.member"));

        if(patreons.find(u=>u.userId===member.id)) return message.reply(Localisation.getTranslation("patreon.user.already"));

        const patreon=new PatreonInfo(member.id, new Date().getTime());
        patreons.push(patreon);
        await Patreon.set(message.guild.id, patreons);
        return message.channel.send(Localisation.getTranslation("patreon.add", member));
    }
}

class RemoveSubCommand extends SubCommand{
    public constructor(){
        super("remove");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, message.guild.id);

        if(!patreons||!patreons.length) return message.reply(Localisation.getTranslation("error.empty.patreon"));

        const member=await getMemberFromMention(args[0], message.guild);
        if(!member) return message.reply(Localisation.getTranslation("error.invalid.member"));

        if(!patreons.find(u=>u.userId===member.id)) return message.reply(Localisation.getTranslation("patreon.user.not"));

        const index=patreons.findIndex(u=>u.userId===member.id);
        if(index>=0) patreons.splice(index, 1);
        await Patreon.set(message.guild.id, patreons);
        return message.channel.send(Localisation.getTranslation("patreon.remove", member));
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, message.guild.id);

        if(!patreons||!patreons.length) return message.reply(Localisation.getTranslation("error.empty.patreon"));

        const data=[];
        await asyncForEach(patreons, async(patreon : PatreonInfo)=>{
            const member=await getMemberByID(patreon.userId, message.guild);
            if(!member) return;
            data.push(Localisation.getTranslation("patreon.list", member, getStringTime(patreon.date, 10)));
        });
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        return message.channel.send(embed);
    }
}

export=PatreonCommand;