import { MessageEmbed, Guild, GuildMember, User, TextBasedChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID, PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { Info, Category, Categories, CustomCommands } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments, CommandAvailable, CommandAccess } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { asyncForEach, isDM, isPatreon, getServerDatabase, isModerator, createMessageEmbed } from "../../utils/Utils";

class HelpCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(false, "argument.category")];
        this.category = Info;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const available = isDM(cmdArgs.channel) ? CommandAvailable.DM : CommandAvailable.Guild;
        if (!cmdArgs.args.length) {
            const embed = new MessageEmbed();
            embed.setTitle(Localisation.getTranslation("help.title"));
            const categories = [];
            const categoryEmojis: { emoji: string, category: Category }[] = [];
            await asyncForEach(Categories, async (category: Category) => {
                if (category.availability === CommandAvailable.Both || (category.availability === available)) {
                    if (category.access) {
                        switch (category.access) {
                            case CommandAccess.Patreon: {
                                if (isDM(cmdArgs.channel) || !(await isPatreon(cmdArgs.author.id, cmdArgs.guildId)))
                                    return;
                            } break;
                            case CommandAccess.BotOwner: {
                                if (cmdArgs.author.id !== OWNER_ID)
                                    return;
                            } break;
                            case CommandAccess.Moderators: {
                                if (isDM(cmdArgs.channel) || !isModerator(cmdArgs.member))
                                    return;
                            } break;
                            case CommandAccess.GuildOwner: {
                                if (isDM(cmdArgs.channel) || cmdArgs.author.id !== cmdArgs.guild.ownerId)
                                    return;
                            } break;
                            case CommandAccess.None: {
                                switch (category) {
                                    case CustomCommands: {
                                        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
                                        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);
                                        if (!customCommands.length)
                                            return;
                                    } break;
                                }
                            } break;
                        }
                    }
                    categoryEmojis.push({ "emoji": category.emoji, "category": category });
                    categories.push(Localisation.getTranslation("help.category", category.emoji, Localisation.getTranslation(category.name)));
                }
            });
            embed.setDescription(categories.join("\n"));
            embed.setFooter({ text: Localisation.getTranslation("help.footer", PREFIX) });

            const options: SelectOption[] = [];

            categoryEmojis.forEach(emoji => {
                options.push({
                    label: Localisation.getTranslation(emoji.category.name),
                    value: emoji.category.name,
                    emoji: emoji.emoji,
                    onSelect: async ({ interaction }) => {
                        const embed = await getCommands(emoji.category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
                        if (!embed.fields.length)
                            return interaction.update({ content: Localisation.getTranslation("error.invalid.category.commands"), components: [] });
                        return interaction.update({ embeds: [embed], components: [] });
                    }
                });
            });

            return await createMessageSelection({
                sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, options: { embeds: [await createMessageEmbed(embed, cmdArgs.guild)] }, selectMenuOptions:
                {
                    options
                }
            });
        }

        let category: Category;
        for (const _category of Categories) {
            if (_category.getNames.map(value => value.toLowerCase()).includes(cmdArgs.args.join(" ").toLowerCase())) {
                category = _category;
                break;
            }
        }
        if (!category) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category"));

        if (category.availability !== CommandAvailable.Both && (category.availability !== available)) return cmdArgs.message.reply("That category is not available here!");

        const embed = await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
        if (!embed.fields.length) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category.commands"));
        return cmdArgs.message.reply({ embeds: [embed] });
    }

}

async function getCommands(category: Category, available: CommandAvailable, channel: TextBasedChannel, guild: Guild, member: GuildMember, author: User) {
    const embed = new MessageEmbed();
    embed.setTitle(`${category.emoji}: ${Localisation.getTranslation(category.name)}`);
    if (category === CustomCommands) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, guild.id);
        await asyncForEach(customCommands, async (customCommand: CustomCommand) => {
            switch (customCommand.access) {
                case CommandAccess.Patreon: {
                    if (isDM(channel) || !(await isPatreon(author.id, guild.id)))
                        return;
                } break;
                case CommandAccess.Moderators: {
                    if (isDM(channel) || !isModerator(member)) {
                        return;
                    }
                } break;
                case CommandAccess.GuildOwner: {
                    if (isDM(channel) || author.id !== guild.ownerId) {
                        return;
                    }
                } break;
                case CommandAccess.BotOwner: {
                    if (author.id !== OWNER_ID) {
                        return;
                    }
                } break;
            }
            embed.addField(customCommand.name, customCommand.description);
        });
    } else {
        BotUser.Commands.forEach((command, name) => {
            if (command.category === category) {
                if (command.available === CommandAvailable.Both || (command.available === available)) {
                    if ((command.guildIds && command.guildIds.includes(guild.id)) || (!command.guildIds || !command.guildIds.length)) {
                        switch (command.access) {
                            case CommandAccess.Moderators: {
                                if (isDM(channel) || !isModerator(member)) {
                                    return;
                                }
                            } break;
                            case CommandAccess.GuildOwner: {
                                if (isDM(channel) || author.id !== guild.ownerId) {
                                    return;
                                }
                            } break;
                            case CommandAccess.BotOwner: {
                                if (author.id !== OWNER_ID) {
                                    return;
                                }
                            } break;
                        }

                        let title = name;
                        if (!command.enabled) title += ` - ${Localisation.getTranslation("help.command.disabled")}`;
                        let description = Localisation.getTranslation(command.description);
                        if (command.aliases) description += `\n${Localisation.getTranslation("help.command.aliases", command.aliases.join(", "))}`;
                        if (command.usage) description += `\n${Localisation.getTranslation("help.command.usage", command.getUsage())}`;
                        if (command.access === CommandAccess.Patreon) description += `\n${Localisation.getTranslation("help.command.patreon")}`;
                        embed.addField(title, description);
                    }
                }
            }
        });
    }
    embed.setColor((await getBotRoleColor(guild)));
    return embed;
}

export = HelpCommand;