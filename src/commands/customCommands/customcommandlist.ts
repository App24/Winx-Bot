import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID } from "../../Constants";
import { Localisation } from "../../localisation";
import { CustomCommandsSettings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { capitalise } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageEmbed, getServerDatabase } from "../../utils/Utils";

class CustomCommandListCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = CustomCommandsSettings;
        this.usage = [new CommandUsage(false, "argument.name")];
        this.aliases = ["cclist"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

        if (!customCommands.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.customcommands"));

        if (!cmdArgs.args.length) {
            const embed = new MessageEmbed();
            const data = [];
            embed.setTitle(Localisation.getTranslation("customcommand.list.title"));
            customCommands.forEach(customCommand => {
                switch (customCommand.access) {
                    case CommandAccess.Moderators: {
                        if (!cmdArgs.member.permissions.has("MANAGE_GUILD")) {
                            return;
                        }
                    } break;
                    case CommandAccess.GuildOwner: {
                        if (cmdArgs.author.id !== cmdArgs.guild.ownerId) {
                            return;
                        }
                    } break;
                    case CommandAccess.BotOwner: {
                        if (cmdArgs.author.id !== OWNER_ID) {
                            return;
                        }
                    } break;
                }
                data.push(customCommand.name);
            });
            embed.setDescription(data.join("\n"));
            cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
        } else {
            const customCommand = customCommands.find(c => c.name.toLowerCase() === cmdArgs.args[0].toLowerCase());
            if (!customCommand) return cmdArgs.message.reply(Localisation.getTranslation("customcommand.error.command.not.exist"));
            const embed = new MessageEmbed();
            embed.setTitle(capitalise(customCommand.name));
            embed.setDescription(customCommand.outputs.join("\n"));
            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
            cmdArgs.message.reply({ embeds: [embed] });
        }
    }
}

export = CustomCommandListCommand;