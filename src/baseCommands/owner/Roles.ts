import { EmbedBuilder } from "discord.js";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class RolesBaseCommand extends BaseCommand {
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