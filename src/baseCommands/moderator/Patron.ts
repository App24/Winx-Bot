import { EmbedBuilder } from "discord.js";
import { Localisation } from "../../localisation";
import { dateToString } from "../../utils/FormatUtils";
import { getBotRoleColor, getMemberById, getMemberFromMention } from "../../utils/GetterUtils";
import { asyncForEach, getDatabase, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType, BaseSubBaseCommand } from "../BaseCommand";
import { PatronData } from "../../structs/databaseTypes/PatronData";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class PatronBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.subCommands = [new AddPatronSubBaseCommand(), new RemovePatronSubBaseCommand(), new ListPatronSubBaseCommand()];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

    }

    public async onRun(cmdArgs: BaseCommandType) {
        const name = cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class AddPatronSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("add");
        this.minArgs = 1;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        const patrons = await getDatabase(PatronData, { guildId: cmdArgs.guildId });

        if (patrons.find(u => u.document.userId === member.id)) return cmdArgs.reply("patreon.user.already");

        const patron = new PatronData({ guildId: cmdArgs.guildId, userId: member.id, date: new Date() });
        await patron.save();
        return cmdArgs.reply("patreon.add", member);
    }

}

class RemovePatronSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("remove");
        this.minArgs = 1;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        const patron = await getOneDatabase(PatronData, { guildId: cmdArgs.guildId, userId: member.id });

        if (patron.isNull()) return cmdArgs.reply("patreon.user.not");

        await PatronData.deleteOne({ guildId: cmdArgs.guildId, userId: member.id });
        return cmdArgs.reply("patreon.remove", member);
    }
}

class ListPatronSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("list");
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const patrons = await getDatabase(PatronData, { guildId: cmdArgs.guildId });

        if (!patrons.length) return cmdArgs.reply("error.empty.patreon");

        const data = [];
        await asyncForEach(patrons, async (patron) => {
            const member = await getMemberById(patron.document.userId, cmdArgs.guild);
            if (!member) return;
            data.push(Localisation.getLocalisation("patreon.list", member, dateToString(patron.document.date, "{dd}/{MM}/{YYYY}")));
        });
        const embed = new EmbedBuilder();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        return cmdArgs.reply({ embeds: [embed] });
    }
}