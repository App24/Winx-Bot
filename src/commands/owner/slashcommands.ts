import { BotUser } from "../../BotClient";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Owner } from "../../structs/Category";
import { Localisation } from "../../localisation";

class RegisterSlashCommandsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options:
                    [
                        {
                            label: Localisation.getTranslation("button.register"),
                            value: "register",
                            onSelect: async ({ interaction }) => {
                                const commands = BotUser.SlashCommands.map((c, n) => {
                                    const command = c.commandData;
                                    if (command.name === "")
                                        command.name = n;
                                    return command;
                                });
                                await createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                        options: [
                                            {
                                                label: Localisation.getTranslation("button.global"),
                                                value: "global",
                                                onSelect: async ({ interaction }) => {
                                                    BotUser.application.commands.set(commands);
                                                    interaction.reply(Localisation.getTranslation("generic.done"));
                                                }
                                            },
                                            {
                                                label: Localisation.getTranslation("button.guild"),
                                                value: "guild",
                                                onSelect: async ({ interaction }) => {
                                                    cmdArgs.guild.commands.set(commands);
                                                    interaction.reply(Localisation.getTranslation("generic.done"));
                                                }
                                            }
                                        ]
                                    }
                                });
                            }
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
                                                }
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
                                                }
                                            }
                                        ]
                                    }
                                });
                            }
                        }
                    ]
            }
        });
    }
}

export = RegisterSlashCommandsCommand;