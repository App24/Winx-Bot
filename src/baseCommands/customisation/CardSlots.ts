import { ButtonStyle, Message, MessageComponentInteraction, ModalSubmitInteraction, TextInputStyle } from "discord.js";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class CardSlotsBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        const userWings = await getOneDatabase(CustomWings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id });

        const slotsMenuOptions: string[] = [];

        userSettings.document.cardSlots.forEach(cardSlot => {
            slotsMenuOptions.push(cardSlot.name);
        });

        const selectMenuOptions: SelectOption[] = [];

        const userFolder = join(CUSTOM_WINGS_FOLDER, cmdArgs.guildId, cmdArgs.author.id);

        if (!existsSync(userFolder)) {
            mkdirSync(userFolder, { recursive: true });
        }

        selectMenuOptions.push({
            label: Localisation.getLocalisation("button.save"),
            value: "save",
            default: false,
            description: null,
            emoji: null,
            async onSelect({ interaction }) {
                const options: SelectOption[] = [];

                const saveCode = async (slotName: string, target: MessageComponentInteraction | Message | ModalSubmitInteraction) => {
                    const saveSlot = userSettings.document.cardSlots.find(c => c.name.toLowerCase() === slotName.toLowerCase());

                    let wingsFile = "";

                    if (!userWings.isNull()) {
                        wingsFile = join(userFolder, `${slotName}.png`);
                        copyFileSync(userWings.document.wingsFile, wingsFile);
                    }

                    if (saveSlot) {
                        saveSlot.name = slotName;
                        saveSlot.code = userSettings.document.cardCode;
                        saveSlot.customWings = wingsFile;
                    } else {
                        userSettings.document.cardSlots.push({ name: slotName, code: userSettings.document.cardCode, customWings: wingsFile });
                    }

                    await userSettings.save();

                    if (target instanceof ModalSubmitInteraction) {
                        target.reply(Localisation.getLocalisation("generic.done"));
                    } else {
                        target.reply(Localisation.getLocalisation("generic.done"));
                    }
                };

                options.push({
                    label: Localisation.getLocalisation("button.new"),
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
                label: Localisation.getLocalisation("button.load"),
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
                                const cardSlot = userSettings.document.cardSlots.find(c => c.name === slot);

                                if (!cardSlot) {
                                    return interaction.reply(Localisation.getLocalisation("error.generic"));
                                }

                                if (cardSlot.customWings !== "" && existsSync(cardSlot.customWings)) {
                                    const wingsFile = join(CUSTOM_WINGS_FOLDER, cmdArgs.guildId, `${cmdArgs.author.id}.png`);

                                    copyFileSync(cardSlot.customWings, wingsFile);

                                    if (userWings) {
                                        userWings.document.wingsFile = wingsFile;
                                    } else {
                                        userWings.document = new CustomWings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id, wingsFile });
                                    }

                                    await userWings.save();
                                }

                                userSettings.document.cardCode = cardSlot.code;

                                await userSettings.save();

                                interaction.reply(Localisation.getLocalisation("generic.done"));
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
                label: Localisation.getLocalisation("button.remove"),
                value: "remove",
                default: false,
                description: null,
                emoji: null,
                async onSelect({ interaction }) {
                    const options: SelectOption[] = [];

                    options.push({
                        label: Localisation.getLocalisation("button.cancel"),
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
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getLocalisation("generic.confirmation"), buttons: [
                                        {
                                            customId: "accept",
                                            style: ButtonStyle.Primary,
                                            label: Localisation.getLocalisation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                const slotIndex = userSettings.document.cardSlots.findIndex(c => c.name === slot);

                                                if (slotIndex < 0) return interaction.reply(Localisation.getLocalisation("error.generic"));

                                                const cardSlot = userSettings.document.cardSlots[slotIndex];

                                                if (cardSlot.customWings !== "" && existsSync(cardSlot.customWings)) {
                                                    rmSync(cardSlot.customWings);
                                                }

                                                userSettings.document.cardSlots.splice(slotIndex, 1);

                                                await userSettings.save();

                                                interaction.reply(Localisation.getLocalisation("generic.done"));
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            style: ButtonStyle.Danger,
                                            label: Localisation.getLocalisation("button.cancel"),
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