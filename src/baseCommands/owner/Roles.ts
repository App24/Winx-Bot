import { EmbedBuilder } from "discord.js";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class RolesBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const data = [];
        cmdArgs.guild.roles.cache.forEach(role => {
            data.push(`${role}: ${role.id}`);
        });

        const embed = new EmbedBuilder();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        cmdArgs.reply({ embeds: [embed] });
    }
}