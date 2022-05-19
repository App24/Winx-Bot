import { Message, TextBasedChannel, User, MessageSelectOptionData, MessageActionRow, MessageSelectMenu, MessageOptions, MessageComponentInteraction, GuildMember } from "discord.js";
import { MAX_ITEMS_PER_SELECT_MENU } from "../Constants";
import { Localisation } from "../localisation";
import { InteractionData } from "./MessageButtonUtils";
import { asyncForEach } from "./Utils";

export async function createMessageSelection(messageSelectData: MessageSelectData) {
    const { sendTarget, author, selectMenuOptions } = messageSelectData;
    let { settings, options } = messageSelectData;

    if (Array.isArray(selectMenuOptions)) {
        if (selectMenuOptions.length > 5) selectMenuOptions.splice(5, selectMenuOptions.length - 5);
    }

    const optionsList = (Array.isArray(selectMenuOptions) ? selectMenuOptions : [selectMenuOptions]);

    const rows: MessageActionRow[] = [];
    for (let i = 0; i < optionsList.length; i++) {
        rows.push(new MessageActionRow());
    }

    const selectOptions: { selectMenu: SelectMenuOptions, selectIndex: number, options: SelectOption[][] }[] = [];

    optionsList.forEach((selectMenu, index) => {
        const custom_id = selectMenu.customId || `selection${index}`;
        const tempOptions: SelectOption[][] = [];
        const options = [...selectMenu.options];

        let selectIndex = 0;

        do {
            const toAddOptions = options.splice(0, Math.min(MAX_ITEMS_PER_SELECT_MENU, options.length));
            if (options.length > 0 && selectIndex < Math.floor(selectMenu.options.length / MAX_ITEMS_PER_SELECT_MENU)) {
                toAddOptions.push({
                    label: "Next",
                    value: "next",
                    onSelect: async ({ interaction }) => {
                        const row = rows[index];
                        (<MessageSelectMenu>row.components[0]).setOptions(selectOptions[index].options[++selectOptions[index].selectIndex]);
                        rows[index] = row;
                        await interaction.update({ components: rows });
                    }
                });
            }
            if (selectIndex > 0) {
                toAddOptions.push({
                    label: "Previous",
                    value: "previous",
                    onSelect: async ({ interaction }) => {
                        const row = rows[index];
                        (<MessageSelectMenu>row.components[0]).setOptions(selectOptions[index].options[--selectOptions[index].selectIndex]);
                        rows[index] = row;
                        await interaction.update({ components: rows });
                    }
                });
            }
            selectIndex++;
            tempOptions.push(toAddOptions);
        } while (options.length > 0);

        selectOptions.push({ selectMenu, selectIndex: 0, options: tempOptions });
        rows[index].addComponents(new MessageSelectMenu({ custom_id, placeholder: Localisation.getTranslation(selectMenu.placeholder || "generic.selectmenu.placeholder"), options: tempOptions[0], minValues: selectMenu.minValues, maxValues: selectMenu.maxValues }));
    });

    let msg: Message<boolean>;

    let sendMessage;

    if (sendTarget instanceof Message || sendTarget instanceof MessageComponentInteraction) {
        sendMessage = sendTarget.reply.bind(sendTarget);
        if (sendTarget instanceof MessageComponentInteraction) {
            if (!sendTarget.deferred && !sendTarget.replied) {
                await sendTarget.deferUpdate();
            }
            sendMessage = sendTarget.followUp.bind(sendTarget);
        }
    } else {
        sendMessage = sendTarget.send.bind(sendTarget);
    }

    //const sendMessage = sendTarget instanceof Message ? sendTarget.reply.bind(sendTarget) : (sendTarget instanceof MessageComponentInteraction ?  : sendTarget.send.bind(sendTarget));

    if (typeof options === "string")
        msg = await sendMessage({ content: options, components: rows });
    else {
        if (!options) {
            options = { components: rows };
        } else {
            options.components = rows;
        }
        msg = await sendMessage(options);
    }

    let authorId: string;

    if (author)
        authorId = (typeof author === "string" ? author : author.id);

    if (!settings) {
        settings = { max: Number.MAX_SAFE_INTEGER, time: 1000 * 60 * 5 };
    }

    if (!settings.time) settings.time = 1000 * 60 * 5;

    let use = 0;

    const collector = msg.createMessageComponentCollector({ filter: () => true, time: settings.time });

    collector.on("end", () => {
        const components = msg.components;
        if (components.length > 0) {
            components.forEach(component => {
                component.components.forEach(c => {
                    c.disabled = true;
                });
            });
        }
        msg.edit({ components: components });
    });

    const data = { information: {} };

    collector.on("collect", async (interaction) => {
        if (interaction.isSelectMenu()) {
            if (author && interaction.user.id !== authorId) {
                await interaction.reply({ ephemeral: true, content: Localisation.getTranslation("generic.not.author") });
                return;
            }
            let navigation = false;
            await asyncForEach(selectOptions, async (value, index) => {
                const selectMenu = value.selectMenu;
                const custom_id = selectMenu.customId || `selection${index}`;
                if (custom_id === interaction.customId) {
                    if (selectMenu.onSelection)
                        await selectMenu.onSelection({ interaction, message: msg, data, collector });
                    await asyncForEach(value.options[value.selectIndex], async (option) => {
                        await asyncForEach(interaction.values, async (value) => {
                            if (option.value === value) {
                                navigation = ["next", "previous"].includes(value);
                                await option.onSelect({ interaction, message: msg, data, collector });
                            }
                        });
                    });
                }
            });
            if (!navigation) {
                use++;
                if (settings.max && settings.max > 0 && use >= settings.max) {
                    collector.emit("end", "");
                }
            }
        }
    });

    return collector;
}

export interface MessageSelectData {
    sendTarget: Message | TextBasedChannel | MessageComponentInteraction,
    author?: User | string | GuildMember,
    options?: string | MessageOptions,
    settings?: { max?: number, time?: number },
    selectMenuOptions: SelectMenuOptions[] | SelectMenuOptions
}

export interface SelectMenuOptions {
    customId?: string,
    placeholder?: string,
    minValues?: number,
    maxValues?: number,
    onSelection?(interactionData: InteractionData): void,
    options: SelectOption[]
}

export interface SelectOption extends MessageSelectOptionData {
    onSelect(interactionData: InteractionData): void;
}