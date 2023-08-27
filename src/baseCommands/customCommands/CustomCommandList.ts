import { EmbedBuilder } from "discord.js";
import { Localisation } from "../../localisation";
import { CommandAccess } from "../../structs/CommandAccess";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { capitalise } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageEmbed, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandListBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const customCommands = await getDatabase(CustomCommand, { guildId: cmdArgs.guildId });

        if (!customCommands.length) return cmdArgs.reply("error.empty.customcommands");

        if (!cmdArgs.args.length) {
            const embed = new EmbedBuilder();
            const data = [];
            embed.setTitle(Localisation.getLocalisation("customcommand.list.title"));
            customCommands.forEach(customCommand => {
                switch (customCommand.document.access) {
                    case CommandAccess.Moderators: {
                        if (!cmdArgs.member.permissions.has("ManageGuild")) {
                            return;
                        }
                    } break;
                    case CommandAccess.GuildOwner: {
                        if (cmdArgs.author.id !== cmdArgs.guild.ownerId) {
                            return;
                        }
                    } break;
                    case CommandAccess.BotOwner: {
                        if (cmdArgs.author.id !== process.env.OWNER_ID) {
                            return;
                        }
                    } break;
                }
                data.push(customCommand.document.name);
            });
            embed.setDescription(data.join("\n"));
            cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
        } else {
            const customCommand = customCommands.find(c => c.document.name.toLowerCase() === cmdArgs.args[0].toLowerCase());
            if (!customCommand) return cmdArgs.reply("customcommand.error.command.not.exist");
            const embed = new EmbedBuilder();
            embed.setTitle(capitalise(customCommand.document.name));
            embed.setDescription(customCommand.document.outputs.join("\n"));
            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
            cmdArgs.reply({ embeds: [embed] });
        }
    }
}