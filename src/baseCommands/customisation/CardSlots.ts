import { ButtonStyle, Message, MessageComponentInteraction, ModalSubmitInteraction, TextInputStyle } from "discord.js";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { BotUser } from "../../BotClient";
import { CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";

export class CardSlotsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
        const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        const wingsIndex = customWings.findIndex(u => u.userId === cmdArgs.author.id);
        if (wingsIndex < 0) {
            //return interaction.followUp(Localisation.getTranslation("error.customwings.user.none"));
        }
        const userWings = wingsIndex >= 0 ? customWings[wingsIndex] : null;

        if (!userSettings.cardSlots) userSettings.cardSlots = [];

        const slotsMenuOptions: string[] = [];

        userSettings.cardSlots.forEach(cardSlot => {
            slotsMenuOptions.push(cardSlot.name);
        });

        const selectMenuOptions: SelectOption[] = [];

        const userFolder = join(CUSTOM_WINGS_FOLDER, cmdArgs.guildId, cmdArgs.author.id);

        if (!existsSync(userFolder)) {
            mkdirSync(userFolder, { recursive: true });
        }

        selectMenuOptions.push({
            label: Localisation.getTranslation("button.save"),
            value: "save",
            default: false,
            description: null,
            emoji: null,
            async onSelect({ interaction }) {
                const options: SelectOption[] = [];

                const saveCode = async (slotName: string, target: MessageComponentInteraction | Message | ModalSubmitInteraction) => {
                    const saveSlot = userSettings.cardSlots.find(c => c.name.toLowerCase() === slotName.toLowerCase());

                    let wingsFile = "";

                    if (userWings) {
                        wingsFile = join(userFolder, `${slotName}.png`);
                        copyFileSync(userWings.wingsFile, wingsFile);
                    }

                    if (saveSlot) {
                        saveSlot.name = slotName;
                        saveSlot.code = userSettings.cardCode;
                        saveSlot.customWings = wingsFile;
                    } else {
                        userSettings.cardSlots.push({ name: slotName, code: userSettings.cardCode, customWings: wingsFile });
                    }

                    await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);

                    if (target instanceof ModalSubmitInteraction) {
                        target.reply(Localisation.getTranslation("generic.done"));
                    } else {
                        target.reply(Localisation.getTranslation("generic.done"));
                    }
                };

                options.push({
                    label: Localisation.getTranslation("button.new"),
                    value: "new",
                    default: false,
                    description: null,
                    emoji: null,
                    async onSelect({ interaction }) {
                        await createInteractionModal({
                            title: "Card Slot",
                            fields: { custom_id: "name", label: "Name", style: TextInputStyle.Short, required: true },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction }) {
                                saveCode(data.information.name, interaction);
                            }
                        });

                        /*const { value: name, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "cardslots.output.new.reply" });
                        if (!name) return;

                        if (name.length > 100) {
                            return message.reply(Localisation.getTranslation("error.message.too.long"));
                        }

                        if (slotsMenuOptions.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
                            return message.reply(Localisation.getTranslation("cardslots.error.slot.exists"));
                        }*/
                    }
                });

                slotsMenuOptions.forEach((slot, i) => {
                    options.push({
                        label: slot,
                        value: i.toString(),
                        default: false,
                        description: null,
                        emoji: null,
                        async onSelect({ interaction }) {
                            saveCode(slot, interaction);
                        },
                    });
                });

                createMessageSelection({
                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                        options
                    }
                });
            },
        });

        if (slotsMenuOptions.length) {
            selectMenuOptions.push({
                label: Localisation.getTranslation("button.load"),
                value: "load",
                default: false,
                description: null,
                emoji: null,
                async onSelect({ interaction }) {

                    const options: SelectOption[] = [];

                    slotsMenuOptions.forEach((slot, i) => {
                        options.push({
                            label: slot,
                            value: i.toString(),
                            default: false,
                            description: null,
                            emoji: null,
                            async onSelect({ interaction }) {
                                const cardSlot = userSettings.cardSlots.find(c => c.name === slot);

                                if (!cardSlot) {
                                    return interaction.reply(Localisation.getTranslation("error.generic"));
                                }

                                if (cardSlot.customWings !== "" && existsSync(cardSlot.customWings)) {
                                    const wingsFile = join(CUSTOM_WINGS_FOLDER, cmdArgs.guildId, `${cmdArgs.author.id}.png`);

                                    copyFileSync(cardSlot.customWings, wingsFile);

                                    if (userWings) {
                                        userWings.wingsFile = wingsFile;
                                    } else {
                                        customWings.push({ userId: cmdArgs.author.id, wingsFile: wingsFile });
                                    }

                                    await CustomWingsDatabase.set(cmdArgs.guildId, customWings);
                                }

                                userSettings.cardCode = cardSlot.code;

                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);

                                interaction.reply(Localisation.getTranslation("generic.done"));
                            },
                        });
                    });

                    createMessageSelection({
                        sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                            options
                        }
                    });
                },
            });

            selectMenuOptions.push({
                label: Localisation.getTranslation("button.remove"),
                value: "remove",
                default: false,
                description: null,
                emoji: null,
                async onSelect({ interaction }) {
                    const options: SelectOption[] = [];

                    options.push({
                        label: Localisation.getTranslation("button.cancel"),
                        value: "cancel",
                        onSelect: async ({ interaction }) => {
                            interaction.deferUpdate();
                        },
                        default: false,
                        description: null,
                        emoji: null
                    });

                    slotsMenuOptions.forEach((slot, i) => {
                        options.push({
                            label: slot,
                            value: i.toString(),
                            default: false,
                            description: null,
                            emoji: null,
                            async onSelect({ interaction }) {
                                createMessageButtons({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("generic.confirmation"), buttons: [
                                        {
                                            customId: "accept",
                                            style: ButtonStyle.Primary,
                                            label: Localisation.getTranslation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                const slotIndex = userSettings.cardSlots.findIndex(c => c.name === slot);

                                                if (slotIndex < 0) return interaction.reply(Localisation.getTranslation("error.generic"));

                                                const cardSlot = userSettings.cardSlots[slotIndex];

                                                if (cardSlot.customWings !== "" && existsSync(cardSlot.customWings)) {
                                                    rmSync(cardSlot.customWings);
                                                }

                                                userSettings.cardSlots.splice(slotIndex, 1);


                                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);

                                                interaction.reply(Localisation.getTranslation("generic.done"));
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            style: ButtonStyle.Danger,
                                            label: Localisation.getTranslation("button.cancel"),
                                            onRun: async ({ interaction }) => {
                                                await interaction.deferUpdate();
                                            }
                                        }
                                    ]
                                });
                            },
                        });
                    });

                    createMessageSelection({
                        sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                            options
                        }
                    });
                }
            });
        }

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: selectMenuOptions
            }
        });
    }
}