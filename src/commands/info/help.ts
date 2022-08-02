import { MessageEmbed, Guild, GuildMember, User, TextBasedChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { Info, Category, Categories, CustomCommands } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { asyncForEach, isDM, isPatreon, getServerDatabase, isModerator, createMessageEmbed, asyncMapForEach, isBooster } from "../../utils/Utils";

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
            const categoryEmojis: Category[] = [];
            await asyncForEach(Categories, async (category: Category) => {
                if (category.availability !== CommandAvailable.Both && category.availability !== available) return;
                if (category.access) {
                    switch (category.access) {
                        case CommandAccess.Patreon: {
                            if (isDM(cmdArgs.channel) || !(await isPatreon(cmdArgs.author.id, cmdArgs.guildId)))
                                return;
                        } break;
                        case CommandAccess.Booster: {
                            if (isDM(cmdArgs.channel) || !isBooster(cmdArgs.member)) {
                                return;
                            }
                        } break;
                        case CommandAccess.BotOwner: {
                            if (cmdArgs.author.id !== process.env.OWNER_ID)
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
                        case CommandAccess.PatreonOrBooster: {
                            if (isDM(cmdArgs.channel) || (!(await isPatreon(cmdArgs.author.id, cmdArgs.channelId) && !isBooster(cmdArgs.member))))
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
                categoryEmojis.push(category);
                categories.push(Localisation.getTranslation("help.category", category.emoji, Localisation.getTranslation(category.name)));
            });
            embed.setDescription(categories.join("\n"));
            embed.setFooter({ text: Localisation.getTranslation("help.footer", PREFIX) });

            const options: SelectOption[] = [];

            categoryEmojis.forEach(category => {
                if (BotUser.getCommands(category).size <= 0 && category !== CustomCommands) return;
                options.push({
                    label: Localisation.getTranslation(category.name),
                    value: category.name,
                    emoji: category.emoji,
                    onSelect: async ({ interaction }) => {
                        const embed = await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
                        if (!embed.fields.length)
                            return interaction.reply({ content: Localisation.getTranslation("error.invalid.category.commands"), components: [] });
                        await interaction.update({ embeds: [embed] });
                    }
                });
            });

            return createMessageSelection({
                sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, options: { embeds: [await createMessageEmbed(embed, cmdArgs.guild)] }, selectMenuOptions:
                {
                    options
                }
            });
        }


        const category = Categories.find(cat => cat.getNames.map(value => value.toLowerCase()).includes(cmdArgs.args.join(" ").toLowerCase()));
        if (!category) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category"));

        if (category.availability !== CommandAvailable.Both && (category.availability !== available)) return cmdArgs.message.reply("That category is not available here!");

        if (BotUser.getCommands(category).size <= 0 && category !== CustomCommands) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category.commands"));

        const embed = await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
        if (!embed.fields.length) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.category.commands"));

        return cmdArgs.message.reply({ embeds: [embed] });
    }

}

async function getCommands(category: Category, available: CommandAvailable, channel: TextBasedChannel, guild: Guild, member: GuildMember, author: User) {
    const embed = new MessageEmbed();
    embed.setTitle(`${category.emoji}: ${Localisation.getTranslation(category.name)}`);

    const addCommand = (title: string, description: string) => {
        embed.addField(title, description, true);
    };

    if (category === CustomCommands) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands: CustomCommand[] = await getServerDatabase(CustomCommands, guild.id);
        await asyncForEach(customCommands, async (customCommand) => {
            switch (customCommand.access) {
                case CommandAccess.Patreon: {
                    if (isDM(channel) || !(await isPatreon(author.id, guild.id)))
                        return;
                } break;
                case CommandAccess.Booster: {
                    if (!isDM(channel) || !isBooster(member)) {
                        return;
                    }
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
                    if (author.id !== process.env.OWNER_ID) {
                        return;
                    }
                } break;
                case CommandAccess.PatreonOrBooster: {
                    if (isDM(channel) || (!(await isPatreon(author.id, guild.id) && !isBooster(member))))
                        return;
                } break;
            }
            addCommand(customCommand.name, customCommand.description);
        });
    } else {
        await asyncMapForEach(BotUser.getCommands(category), async (name, command) => {
            if (command.available === CommandAvailable.Both || (command.available === available)) {
                if ((command.guildIds && command.guildIds.includes(guild.id)) || (!command.guildIds || !command.guildIds.length)) {
                    switch (command.access) {
                        case CommandAccess.Patreon: {
                            if (isDM(channel) || !(await isPatreon(author.id, guild.id)))
                                return;
                        } break;
                        case CommandAccess.Booster: {
                            if (!isDM(channel) || !isBooster(member)) {
                                return;
                            }
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
                            if (author.id !== process.env.OWNER_ID) {
                                return;
                            }
                        } break;
                        case CommandAccess.PatreonOrBooster: {
                            if (isDM(channel) || (!(await isPatreon(author.id, guild.id) && !isBooster(member))))
                                return;
                        } break;
                    }

                    let title = name;
                    if (!command.enabled) title += ` - ${Localisation.getTranslation("help.command.disabled")}`;
                    let description = Localisation.getTranslation(command.description);
                    if (command.aliases) description += `\n${Localisation.getTranslation("help.command.aliases", command.aliases.join(", "))}`;
                    if (command.usage) description += `\n${Localisation.getTranslation("help.command.usage", command.getUsage())}`;
                    if (command.access === CommandAccess.Patreon) description += `\n${Localisation.getTranslation("help.command.patreon")}`;
                    if (command.access === CommandAccess.Booster) description += `\n${Localisation.getTranslation("help.command.booster")}`;
                    addCommand(title, description);
                }
            }
        });
    }
    embed.setColor((await getBotRoleColor(guild)));
    return embed;
}

export = HelpCommand;