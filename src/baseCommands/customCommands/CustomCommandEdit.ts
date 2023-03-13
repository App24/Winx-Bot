import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomCommand } from "../../structs/databaseTypes/CustomCommand";
import { capitalise } from "../../utils/FormatUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomCommandEditBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
        const customCommands: CustomCommand[] = await getServerDatabase(CustomCommands, cmdArgs.guildId);

        if (!customCommands.length) return cmdArgs.reply("error.empty.customcommands");

        const cmdName = cmdArgs.args[0].toLowerCase();
        const customCommand = customCommands.find(c => c.name === cmdName);
        if (!customCommand) return cmdArgs.reply("customcommand.error.command.not.exist");

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, selectMenuOptions: {
                options: [
                    {
                        label: "Description",
                        value: "description",
                        emoji: null,
                        description: null,
                        default: false,
                        async onSelect({ interaction }) {
                            await interaction.reply(`Current Description: "${customCommand.description}"`);

                            const { value: newDescription, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "Enter new description" });
                            if (!newDescription) return;

                            customCommand.description = newDescription;

                            await CustomCommands.set(cmdArgs.guildId, customCommands);
                            message.reply(Localisation.getTranslation("customcommand.success.edit"));
                        },
                    },
                    {
                        label: "Access",
                        value: "access",
                        default: false,
                        emoji: null,
                        description: null,
                        async onSelect({ interaction }) {
                            const accessStrings = ["", "Everyone", "Patron", "Booster", "Moderators", "Server Owner", "Bot Owner", "Patron or Booster"];

                            await interaction.reply(`Current Access Level: ${accessStrings[customCommand.access ?? 1]}`);

                            const options: SelectOption[] = [];

                            Object.keys(CommandAccess).forEach((character) => {
                                const intIndex = parseInt(character);
                                if (isNaN(intIndex)) return;
                                options.push({
                                    value: accessStrings[intIndex],
                                    label: capitalise(accessStrings[intIndex]),
                                    default: intIndex === customCommand.access,
                                    onSelect: async ({ interaction }) => {

                                        customCommand.access = intIndex;

                                        await CustomCommands.set(cmdArgs.guildId, customCommands);

                                        interaction.reply(Localisation.getTranslation("customcommand.success.edit"));
                                    },
                                    description: null,
                                    emoji: null
                                });
                            });

                            options.push({
                                value: "cancel",
                                label: Localisation.getTranslation("generic.cancel"),
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, selectMenuOptions: {
                                    options
                                }
                            });
                        }
                    },
                    {
                        label: "Outputs",
                        value: "outputs",
                        default: false,
                        emoji: null,
                        description: null,
                        async onSelect({ interaction }) {
                            const options: SelectOption[] = [];

                            customCommand.outputs.forEach((output, i) => {
                                options.push({
                                    label: output.substring(0, Math.min(output.length, 100)),
                                    value: `output_${i}`,
                                    default: false,
                                    emoji: null,
                                    description: null,
                                    async onSelect({ interaction }) {
                                        // interaction.deferUpdate();

                                        createMessageSelection({
                                            sendTarget: interaction, author: cmdArgs.author, selectMenuOptions: {
                                                options: [
                                                    {
                                                        label: "Edit",
                                                        value: "edit",
                                                        default: false,
                                                        description: null,
                                                        emoji: null,
                                                        async onSelect({ interaction }) {
                                                            const { value: newOutput, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "Enter new output" });
                                                            if (!newOutput) return;

                                                            customCommand.outputs[i] = newOutput;

                                                            await CustomCommands.set(cmdArgs.guildId, customCommands);
                                                            message.reply(Localisation.getTranslation("customcommand.success.edit"));
                                                        }
                                                    },
                                                    {
                                                        label: "Remove",
                                                        value: "remove",
                                                        default: false,
                                                        description: null,
                                                        emoji: null,
                                                        async onSelect({ interaction }) {
                                                            customCommand.outputs.splice(i, 1);

                                                            await CustomCommands.set(cmdArgs.guildId, customCommands);

                                                            interaction.reply(Localisation.getTranslation("customcommand.success.edit"));
                                                        }
                                                    },
                                                    {
                                                        value: "cancel",
                                                        label: Localisation.getTranslation("generic.cancel"),
                                                        onSelect: async ({ interaction }) => {
                                                            interaction.deferUpdate();
                                                        },
                                                        default: false,
                                                        description: null,
                                                        emoji: null
                                                    }
                                                ]
                                            }
                                        });
                                    }
                                });
                            });

                            options.push({
                                value: "add",
                                label: Localisation.getTranslation("button.add"),
                                default: false,
                                description: null,
                                emoji: null,
                                async onSelect({ interaction }) {
                                    const { value: newOutput, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "Enter new output" });
                                    if (!newOutput) return;

                                    customCommand.outputs.push(newOutput);

                                    await CustomCommands.set(cmdArgs.guildId, customCommands);
                                    message.reply(Localisation.getTranslation("customcommand.success.edit"));
                                }
                            });

                            options.push({
                                value: "cancel",
                                label: Localisation.getTranslation("generic.cancel"),
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, selectMenuOptions: {
                                    options
                                }
                            });
                        }
                    }
                ]
            }
        });
    }
}

// export class CustomCommandEditBaseCommand extends BaseCommand {
//     public async onRun(cmdArgs: BaseCommandType) {
//         const CustomCommands = BotUser.getDatabase(DatabaseType.CustomCommands);
//         const customCommands = await getServerDatabase<CustomCommand[]>(CustomCommands, cmdArgs.guildId);

//         if (!customCommands.length) return cmdArgs.reply("error.empty.customcommands");

//         const cmdName = cmdArgs.args[0].toLowerCase();
//         const customCommand = customCommands.find(c => c.name === cmdName);
//         if (!customCommand) {
//             return cmdArgs.reply("customcommand.error.command.not.exist");
//         }

//         const type = cmdArgs.args[1].toLowerCase();
//         let op: EditSettings;
//         switch (type) {
//             case "desc":
//             case "description": {
//                 op = EditSettings.Description;
//             } break;
//             case "access": {
//                 op = EditSettings.Access;
//             } break;
//             case "message":
//             case "out":
//             case "output": {
//                 op = EditSettings.Output;
//             } break;
//             default: {
//                 return cmdArgs.reply("customcommand.invalid.type");
//             } break;
//         }

//         const value = cmdArgs.args[2];
//         switch (op) {
//             case EditSettings.Description: {
//                 customCommand.description = value;
//             } break;
//             case EditSettings.Access: {
//                 let access: CommandAccess;
//                 switch (value.toLowerCase()) {
//                     case "moderator": {
//                         access = CommandAccess.Moderators;
//                     } break;
//                     case "owner": {
//                         access = CommandAccess.GuildOwner;
//                     } break;
//                     case "creator":
//                     case "botowner": {
//                         access = CommandAccess.BotOwner;
//                     } break;
//                     case "patreon": {
//                         access = CommandAccess.Patreon;
//                     } break;
//                     case "booster": {
//                         access = CommandAccess.Booster;
//                     } break;
//                     default: {
//                         return cmdArgs.reply("customcommand.invalid.access");
//                     } break;
//                 }
//                 customCommand.access = access;
//             } break;
//             case EditSettings.Output: {
//                 if (cmdArgs.args[3]) {
//                     const index = customCommand.outputs.findIndex(output => output.toLowerCase() === value.toLowerCase());
//                     if (index > -1) {
//                         customCommand.outputs[index] = cmdArgs.args[3];
//                     } else
//                         return cmdArgs.reply("customcommand.undefined.output");
//                 } else {
//                     const index = customCommand.outputs.findIndex(output => output.toLowerCase() === value.toLowerCase());
//                     if (index > -1) {
//                         customCommand.outputs.splice(index, 1);
//                         cmdArgs.reply("customcommand.success.output.remove");
//                     } else {
//                         customCommand.outputs.push(value);
//                         cmdArgs.reply("customcommand.success.output.add");
//                     }
//                 }
//             } break;
//         }
//         await CustomCommands.set(cmdArgs.guildId, customCommands);
//         cmdArgs.reply("customcommand.success.edit");
//     }
// }

// enum EditSettings {
//     Description,
//     Access,
//     Output
// }