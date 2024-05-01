import { GuildMember } from "discord.js";
import { getRoleFromMention } from "../../utils/GetterUtils";
import { asyncForEach } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class GiveRolesBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const members = await cmdArgs.guild.members.fetch().then(promise => Array.from(promise.values()));
        const role = await getRoleFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!role) return cmdArgs.reply("error.invalid.role");
        await cmdArgs.reply("checkranks.start");
        await asyncForEach(members, async (member: GuildMember) => {
            if (member.user.bot) return;
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
            }
        });
        cmdArgs.reply("generic.done");
    }
}