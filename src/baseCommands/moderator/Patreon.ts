import { EmbedBuilder } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { PatreonInfo } from "../../structs/databaseTypes/PatreonInfo";
import { dateToString } from "../../utils/FormatUtils";
import { getBotRoleColor, getMemberById, getMemberFromMention } from "../../utils/GetterUtils";
import { asyncForEach, getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType, BaseSubBaseCommand } from "../BaseCommand";

export class PatreonBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.subCommands = [new AddPatreonSubBaseCommand(), new RemovePatreonSubBaseCommand(), new ListPatreonSubBaseCommand()];
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const name = cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class AddPatreonSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("add");
        this.minArgs = 1;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const Patreon = BotUser.getDatabase(DatabaseType.Paid);
        const patreons: PatreonInfo[] = await getServerDatabase(Patreon, cmdArgs.guildId);

        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        if (patreons.find(u => u.userId === member.id)) return cmdArgs.reply("patreon.user.already");

        const patreon = new PatreonInfo(member.id, new Date().getTime());
        patreons.push(patreon);
        await Patreon.set(cmdArgs.guildId, patreons);
        return cmdArgs.reply("patreon.add", member);
    }

}

class RemovePatreonSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("remove");
        this.minArgs = 1;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const Patreon = BotUser.getDatabase(DatabaseType.Paid);
        const patreons: PatreonInfo[] = await getServerDatabase(Patreon, cmdArgs.guildId);

        if (!patreons.length) return cmdArgs.reply("error.empty.patreon");

        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        if (!patreons.find(u => u.userId === member.id)) return cmdArgs.reply("patreon.user.not");

        const index = patreons.findIndex(u => u.userId === member.id);
        if (index >= 0) patreons.splice(index, 1);
        await Patreon.set(cmdArgs.guildId, patreons);
        return cmdArgs.reply("patreon.remove", member);
    }
}

class ListPatreonSubBaseCommand extends BaseSubBaseCommand {
    public constructor() {
        super("list");
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const Patreon = BotUser.getDatabase(DatabaseType.Paid);
        const patreons: PatreonInfo[] = await getServerDatabase(Patreon, cmdArgs.guildId);

        if (!patreons.length) return cmdArgs.reply("error.empty.patreon");

        const data = [];
        await asyncForEach(patreons, async (patreon: PatreonInfo) => {
            const member = await getMemberById(patreon.userId, cmdArgs.guild);
            if (!member) return;
            data.push(Localisation.getTranslation("patreon.list", member, dateToString(new Date(patreon.date), "{dd}/{MM}/{YYYY}")));
        });
        const embed = new EmbedBuilder();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        return cmdArgs.reply({ embeds: [embed] });
    }
}