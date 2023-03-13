import { ApplicationCommandData, REST, Routes } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { reportError } from "../../utils/Utils";

export class RegisterSlashCommandsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        await createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options:
                    [
                        {
                            label: Localisation.getTranslation("button.register"),
                            value: "register",
                            onSelect: async ({ interaction }) => {
                                await createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                        options: [
                                            {
                                                label: Localisation.getTranslation("button.global"),
                                                value: "global",
                                                onSelect: async ({ interaction }) => {
                                                    const commands = BotUser.SlashCommands.map((c, n) => {
                                                        if (c.guildIds.length) return;
                                                        const command: ApplicationCommandData = c.commandData;
                                                        if (command.name === "")
                                                            command.name = n;
                                                        return command;
                                                    }).filter(c => c !== undefined);
                                                    if (!commands.length) return interaction.reply("No commands to register");
                                                    BotUser.application.commands.set(commands).then(() => {
                                                        interaction.reply(Localisation.getTranslation("generic.done"));
                                                    }).catch(r => {
                                                        reportError(r, interaction);
                                                    });
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            },
                                            {
                                                label: Localisation.getTranslation("button.guild"),
                                                value: "guild",
                                                onSelect: async ({ interaction }) => {
                                                    const commands = BotUser.SlashCommands.map((c, n) => {
                                                        if (c.guildIds.length && !c.guildIds.includes(cmdArgs.guildId)) return;
                                                        const command: ApplicationCommandData = c.commandData;
                                                        if (command.name === "")
                                                            command.name = n;
                                                        return command;
                                                    }).filter(c => c !== undefined);
                                                    if (!commands.length) return interaction.reply("No commands to register");
                                                    cmdArgs.guild.commands.set(commands).then(() => {
                                                        interaction.reply(Localisation.getTranslation("generic.done"));
                                                    }).catch(r => {
                                                        reportError(r, interaction);
                                                    });
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            },
                                            {
                                                label: "Only " + Localisation.getTranslation("button.guild"),
                                                value: "guildOnly",
                                                onSelect: async ({ interaction }) => {
                                                    const commands = BotUser.SlashCommands.map((c, n) => {
                                                        if (!c.guildIds.length) return;
                                                        if (!c.guildIds.includes(cmdArgs.guildId)) return;
                                                        const command: ApplicationCommandData = c.commandData;
                                                        if (command.name === "")
                                                            command.name = n;
                                                        return command;
                                                    }).filter(c => c !== undefined);
                                                    if (!commands.length) return interaction.reply("No commands to register");
                                                    cmdArgs.guild.commands.set(commands).then(() => {
                                                        interaction.reply(Localisation.getTranslation("generic.done"));
                                                    }).catch(r => {
                                                        reportError(r, interaction);
                                                    });
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            }
                                        ]
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        },
                        {
                            label: Localisation.getTranslation("button.reset"),
                            value: "reset",
                            onSelect: async ({ interaction }) => {
                                await createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                        options: [
                                            {
                                                label: Localisation.getTranslation("button.global"),
                                                value: "global",
                                                onSelect: async ({ interaction }) => {
                                                    interaction.deferReply();
                                                    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
                                                    rest.get(Routes.applicationCommands(BotUser.user.id))
                                                        .then((data: any) => {
                                                            const promises = [];
                                                            for (const command of data) {
                                                                const deleteUrl = `${Routes.applicationCommands(BotUser.user.id)}/${command.id}`;
                                                                promises.push(rest.delete(<any>deleteUrl));
                                                            }
                                                            return Promise.all(promises).then(() => interaction.followUp(Localisation.getTranslation("generic.done")));
                                                        });
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            },
                                            {
                                                label: Localisation.getTranslation("button.guild"),
                                                value: "guild",
                                                onSelect: async ({ interaction }) => {
                                                    interaction.deferReply();
                                                    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
                                                    rest.get(Routes.applicationGuildCommands(BotUser.user.id, cmdArgs.guildId))
                                                        .then((data: any) => {
                                                            const promises = [];
                                                            for (const command of data) {
                                                                const deleteUrl = `${Routes.applicationGuildCommands(BotUser.user.id, cmdArgs.guildId)}/${command.id}`;
                                                                promises.push(rest.delete(<any>deleteUrl));
                                                            }
                                                            return Promise.all(promises).then(() => interaction.followUp(Localisation.getTranslation("generic.done")));
                                                        });
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            }
                                        ]
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        }
                    ]
            }
        });
    }
}