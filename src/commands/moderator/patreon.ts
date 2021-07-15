import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getMemberFromMention, getMemberByID } from "../../GetterUtilts";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { PatreonInfo } from "../../structs/databaseTypes/PatreonInfo";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getServerDatabase, getStringTime } from "../../Utils";

class PatreonCommand extends Command{
    public constructor(){
        super("Set or get list of patreons");
        this.category=Moderator;
        this.usage="<add/remove/list> [user]";
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
        if(!member) return message.reply("That is not a member of this server!");

        if(patreons.find(u=>u.userId===member.id)) return message.reply("That user is already a patreon!");

        const patreon=new PatreonInfo(member.id, new Date().getTime());
        patreons.push(patreon);
        await Patreon.set(message.guild.id, patreons);
        return message.channel.send(`Added ${member} as patreon!`);
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

        if(!patreons||!patreons.length) return message.reply("There are no patreons in this server!");

        const member=await getMemberFromMention(args[0], message.guild);
        if(!member) return message.reply("That is not a member of this server!");

        if(!patreons.find(u=>u.userId===member.id)) return message.reply("That user is not a patreon!");

        const index=patreons.findIndex(u=>u.userId===member.id);
        if(index>=0) patreons.splice(index, 1);
        await Patreon.set(message.guild.id, patreons);
        return message.channel.send(`Removed ${member} as patreon!`);
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, message.guild.id);

        if(!patreons||!patreons.length) return message.reply("There are no patreons in this server!");
        const data=[];
        await asyncForEach(patreons, async(patreon : PatreonInfo)=>{
            const member=await getMemberByID(patreon.userId, message.guild);
            if(!member) return;
            data.push(`${member}: Patreon since: ${getStringTime(patreon.date, 10)}`);
        });
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        return message.channel.send(embed);
    }
}

export=PatreonCommand;