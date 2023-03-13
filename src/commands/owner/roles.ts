import { EmbedBuilder } from "discord.js";
import { Owner } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { RolesBaseCommand } from "../../baseCommands/owner/Roles";

class RolesCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.available = CommandAvailable.Guild;
        this.category = Owner;
        this.deprecated = true;

        this.baseCommand = new RolesBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const data = [];
    //     cmdArgs.guild.roles.cache.forEach(role => {
    //         data.push(`${role}: ${role.id}`);
    //     });

    //     const embed = new EmbedBuilder();
    //     embed.setColor((await getBotRoleColor(cmdArgs.guild)));
    //     embed.setDescription(data.join("\n"));
    //     cmdArgs.message.reply({ embeds: [embed] });
    // }
}

export = RolesCommand;