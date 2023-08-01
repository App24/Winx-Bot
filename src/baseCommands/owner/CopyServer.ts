import { ChannelType } from "discord.js";
import { BotUser } from "../../BotClient";
import { asyncForEach, asyncMapForEach } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CopyServerBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const orig = await BotUser.guilds.fetch("1085934209195057262");
        const channels = await orig.channels.fetch();

        const otherRoles = await orig.roles.fetch();
        const equivalentRoles = (await cmdArgs.guild.roles.fetch()).filter(r => {
            return otherRoles.find((r_) => r_.name === r.name) != undefined;
        });

        await asyncMapForEach(channels, async (_, c) => {
            const channel = await cmdArgs.guild.channels.create({
                name: c.name,
                type: c.type
            });
        });
        console.log("Done");
    }
}