import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getMemberFromMention, getMemberById } from "../../GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandUsage, CommandAccess, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { PatreonInfo } from "../../structs/databaseTypes/PatreonInfo";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase, asyncForEach, dateToString, getBotRoleColor } from "../../Utils";

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

    public async onRun(cmdArgs : CommandArguments){
        const name=cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class AddSubCommand extends SubCommand{
    public constructor(){
        super("add");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, cmdArgs.guild.id);

        const member=await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if(!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        if(patreons.find(u=>u.userId===member.id)) return cmdArgs.message.reply(Localisation.getTranslation("patreon.user.already"));

        const patreon=new PatreonInfo(member.id, new Date().getTime());
        patreons.push(patreon);
        await Patreon.set(cmdArgs.guild.id, patreons);
        return cmdArgs.message.reply(Localisation.getTranslation("patreon.add", member));
    }
}

class RemoveSubCommand extends SubCommand{
    public constructor(){
        super("remove");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, cmdArgs.guild.id);

        if(!patreons||!patreons.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.patreon"));

        const member=await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if(!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        if(!patreons.find(u=>u.userId===member.id)) return cmdArgs.message.reply(Localisation.getTranslation("patreon.user.not"));

        const index=patreons.findIndex(u=>u.userId===member.id);
        if(index>=0) patreons.splice(index, 1);
        await Patreon.set(cmdArgs.guild.id, patreons);
        return cmdArgs.message.reply(Localisation.getTranslation("patreon.remove", member));
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(cmdArgs : CommandArguments){
        const Patreon=BotUser.getDatabase(DatabaseType.Paid);
        const patreons:PatreonInfo[]=await getServerDatabase(Patreon, cmdArgs.guild.id);

        if(!patreons||!patreons.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.patreon"));

        const data=[];
        await asyncForEach(patreons, async(patreon : PatreonInfo)=>{
            const member=await getMemberById(patreon.userId, cmdArgs.guild);
            if(!member) return;
            data.push(Localisation.getTranslation("patreon.list", member, dateToString(new Date(patreon.date), "{dd}/{MM}/{YYYY}")));
        });
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        return cmdArgs.message.reply({embeds: [embed]});
    }
}

export=PatreonCommand;