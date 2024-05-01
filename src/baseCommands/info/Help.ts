import { EmbedBuilder, parseEmoji, TextBasedChannel, Guild, GuildMember, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { Category, Categories, CustomCommands } from "../../structs/Category";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { SelectOption, createMessageSelection } from "../../utils/MessageSelectionUtils";
import { isDM, asyncForEach, isPatron, isBooster, isModerator, createMessageEmbed, asyncMapForEach, getDatabase, hasFlagSet } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { hasPermission } from "../../utils/PermissionUtils";

export class HelpBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const available = isDM(cmdArgs.channel) ? CommandAvailable.DM : CommandAvailable.Guild;
        if (!cmdArgs.args.length) {
            const embed = new EmbedBuilder();
            embed.setTitle(Localisation.getLocalisation("help.title"));
            const categories = [];
            const categoryEmojis: Category[] = [];
            await asyncForEach(Categories, async (category: Category) => {
                if (category.availability !== CommandAvailable.Both && category.availability !== available) return;
                if (category.access) {
                    const response = await hasPermission({ commandAccess: category.access, author: cmdArgs.author, member: cmdArgs.member, guild: cmdArgs.guild, isDM: isDM(cmdArgs.channel) });

                    if (!response.hasPermission) return;

                    if (category === CustomCommands) {
                        const customCommands = await getDatabase(CustomCommand, { guildId: cmdArgs.guildId });
                        if (!customCommands.length)
                            return;
                    }
                }
                categoryEmojis.push(category);
                categories.push(Localisation.getLocalisation("help.category", category.emoji, Localisation.getLocalisation(category.name)));
            });
            embed.setDescription(categories.join("\n"));
            embed.setFooter({ text: Localisation.getLocalisation("help.footer", PREFIX) });

            const options: SelectOption[] = [];

            categoryEmojis.forEach(category => {
                if (BotUser.getCommands(category).size <= 0 && category !== CustomCommands) return;
                options.push({
                    label: Localisation.getLocalisation(category.name),
                    value: category.name,
                    emoji: parseEmoji(category.emoji),
                    onSelect: async ({ interaction }) => {
                        const embed = await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
                        if (!embed.data.fields || !embed.data.fields.length)
                            return interaction.reply({ content: Localisation.getLocalisation("error.invalid.category.commands"), components: [] });
                        await interaction.update({ embeds: [embed] });
                    },
                    default: false,
                    description: null
                });
            });

            return createMessageSelection({
                sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, options: { embeds: [await createMessageEmbed(embed, cmdArgs.guild)] }, selectMenuOptions:
                {
                    options
                }
            });
        }


        const category = Categories.find(cat => cat.getNames.map(value => value.toLowerCase()).includes(cmdArgs.args.join(" ").toLowerCase()));
        if (!category) return cmdArgs.reply("error.invalid.category");

        if (category.availability !== CommandAvailable.Both && (category.availability !== available)) return cmdArgs.reply("That category is not available here!");

        if (BotUser.getCommands(category).size <= 0 && category !== CustomCommands) return cmdArgs.reply("error.invalid.category.commands");

        const embed = await getCommands(category, available, cmdArgs.channel, cmdArgs.guild, cmdArgs.member, cmdArgs.author);
        if (!embed.data.fields.length) return cmdArgs.reply("error.invalid.category.commands");

        return cmdArgs.reply({ embeds: [embed] });
    }
}

async function getCommands(category: Category, available: CommandAvailable, channel: TextBasedChannel, guild: Guild, member: GuildMember, author: User) {
    const embed = new EmbedBuilder();
    embed.setTitle(`${category.emoji}: ${Localisation.getLocalisation(category.name)}`);

    const addCommand = (title: string, description: string) => {
        embed.addFields({ name: title, value: description, inline: true });
    };

    if (category === CustomCommands) {
        const customCommands = await getDatabase(CustomCommand, { guildId: guild.id });
        await asyncForEach(customCommands, async (customCommand) => {
            const response = await hasPermission({ commandAccess: customCommand.document.access, author: author, member: member, guild: guild, isDM: isDM(channel) });

            if (!response.hasPermission) return;
            addCommand(customCommand.document.name, customCommand.document.description);
        });
    } else {
        await asyncMapForEach(BotUser.getCommands(category), async (name, command) => {
            if (command.available === CommandAvailable.Both || (command.available === available)) {
                if ((command.guildIds && command.guildIds.includes(guild.id)) || (!command.guildIds || !command.guildIds.length)) {
                    const response = await hasPermission({ commandAccess: command.access, author: author, member: member, guild: guild, isDM: isDM(channel), customCheck: command.baseCommand.customPermissionCheck });

                    if (!response.hasPermission) return;

                    let title = name;
                    if (!command.enabled) title += ` - ${Localisation.getLocalisation("help.command.disabled")}`;
                    let description = Localisation.getLocalisation(command.description);
                    if (command.aliases) description += `\n${Localisation.getLocalisation("help.command.aliases", command.aliases.join(", "))}`;
                    if (command.usage) description += `\n${Localisation.getLocalisation("help.command.usage", PREFIX, name, command.getUsage())}`;
                    if (hasFlagSet(command.access, CommandAccess.Patron)) description += `\n${Localisation.getLocalisation("help.command.patreon")}`;
                    if (hasFlagSet(command.access, CommandAccess.Booster)) description += `\n${Localisation.getLocalisation("help.command.booster")}`;
                    addCommand(title, description);
                }
            }
        });
    }
    embed.setColor((await getBotRoleColor(guild)));
    return embed;
}