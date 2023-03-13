import { EmbedBuilder } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { capitalise } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { getServerDatabase, createMessageEmbed } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandListBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

        if (!customCommands.length) return cmdArgs.reply("error.empty.customcommands");

        if (!cmdArgs.args.length) {
            const embed = new EmbedBuilder();
            const data = [];
            embed.setTitle(Localisation.getTranslation("customcommand.list.title"));
            customCommands.forEach(customCommand => {
                switch (customCommand.access) {
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
                data.push(customCommand.name);
            });
            embed.setDescription(data.join("\n"));
            cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
        } else {
            const customCommand = customCommands.find(c => c.name.toLowerCase() === cmdArgs.args[0].toLowerCase());
            if (!customCommand) return cmdArgs.reply("customcommand.error.command.not.exist");
            const embed = new EmbedBuilder();
            embed.setTitle(capitalise(customCommand.name));
            embed.setDescription(customCommand.outputs.join("\n"));
            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
            cmdArgs.reply({ embeds: [embed] });
        }
    }
}