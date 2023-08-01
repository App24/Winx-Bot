import { TextInputStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings, DEFAULT_CARD_CODE } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";

export class CardCodeBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            await interaction.reply({ content: userSettings.cardCode || DEFAULT_CARD_CODE, ephemeral: true });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            await createInteractionModal({
                                fields: { custom_id: "code", label: "Card Code", max_length: 4000, style: TextInputStyle.Short, required: true },
                                sendTarget: interaction,
                                title: "Set Card Code",
                                onSubmit: async ({ data, interaction }) => {

                                    interaction.reply({ content: Localisation.getTranslation("cardcode.set.output") });

                                    const code = data.information.code;

                                    if (code === undefined) return;
                                    userSettings.cardCode = code;
                                    serverUserSettings[userIndex] = userSettings;
                                    await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                                }
                            });

                            /*const modal = new ModalBuilder({ custom_id: "cardCode", title: "Set Card Code" });

                            const codeTextInput = new TextInputBuilder({ custom_id: "code", label: "Card Code", maxLength: 4000, style: TextInputStyle.Short, required: true });

                            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(codeTextInput);

                            modal.addComponents(row);

                            await interaction.showModal(modal);
                            const subumission = await interaction.awaitModalSubmit({ time: 1000 * 5 * 60 });

                            subumission.reply({ content: Localisation.getTranslation("cardcode.set.output"), ephemeral: true });

                            const code = subumission.fields.getTextInputValue("code");

                            if (code === undefined) return;
                            userSettings.cardCode = code;
                            serverUserSettings[userIndex] = userSettings;
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);*/

                            /*let sendTarget: DMChannel | MessageComponentInteraction = await cmdArgs.author.createDM().catch(() => undefined);
                            if (!sendTarget) {
                                sendTarget = interaction;
                            } else {
                                await interaction.reply("Please check your DM");
                                // await interaction.deferUpdate();
                            }
                            {
                                let sendMessage;

                                if (sendTarget instanceof Message || sendTarget instanceof MessageComponentInteraction) {
                                    sendMessage = sendTarget.reply.bind(sendTarget);
                                    if (sendTarget instanceof MessageComponentInteraction) {
                                        if (!sendTarget.deferred && !sendTarget.replied) {
                                            if (sendTarget instanceof MessageComponentInteraction) {
                                                await sendTarget.deferUpdate();
                                            }
                                        }
                                        sendMessage = sendTarget.followUp.bind(sendTarget);
                                    }
                                } else {
                                    sendMessage = sendTarget.send.bind(sendTarget);
                                }

                                await sendMessage({ content: "If the code is too long, put it into a text file and send it to a mod!" });
                            }
                            const { value: code, message } = await getStringReply({ sendTarget, author: cmdArgs.author, options: "argument.reply.cardcode" });
                            if (code === undefined) return;
                            userSettings.cardCode = code;
                            serverUserSettings[userIndex] = userSettings;
                            message.reply(Localisation.getTranslation("cardcode.set.output", code));
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);*/
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.reset"),
                        value: "reset",
                        onSelect: async ({ interaction }) => {
                            userSettings.cardCode = DEFAULT_CARD_CODE;
                            serverUserSettings[userIndex] = userSettings;
                            interaction.reply(Localisation.getTranslation("cardcode.reset.output"));
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
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