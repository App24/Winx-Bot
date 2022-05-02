import { Message, TextBasedChannel, User, MessageSelectOptionData, MessageActionRow, MessageSelectMenu, MessageOptions } from "discord.js";
import { Localisation } from "../localisation";
import { InteractionData } from "./MessageButtonUtils";
import { asyncForEach } from "./Utils";

export async function createMessageSelection(messageSelectData: MessageSelectData) {
    const { sendTarget, author, options, selectMenuOptions } = messageSelectData;
    let { settings } = messageSelectData;

    if (Array.isArray(selectMenuOptions)) {
        if (selectMenuOptions.length > 5) selectMenuOptions.splice(5, selectMenuOptions.length - 5);
    }

    const rows: MessageActionRow[] = [];
    for (let i = 0; i < (Array.isArray(selectMenuOptions) ? selectMenuOptions.length : 1); i++) {
        rows.push(new MessageActionRow());
    }

    (Array.isArray(selectMenuOptions) ? selectMenuOptions : [selectMenuOptions]).forEach((selectMenu, index) => {
        const custom_id = selectMenu.customId || `selection${index}`;
        rows[index].addComponents(new MessageSelectMenu({ custom_id, placeholder: Localisation.getTranslation(selectMenu.placeholder || "generic.selectmenu.placeholder"), options: selectMenu.options }));
    });

    let msg: Message<boolean>;

    const sendMessage = sendTarget instanceof Message ? sendTarget.reply.bind(sendTarget) : sendTarget.send.bind(sendTarget);

    if (typeof options === "string")
        msg = await sendMessage({ content: options, components: rows });
    else {
        options.components = rows;
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
            await asyncForEach(Array.isArray(selectMenuOptions) ? selectMenuOptions : [selectMenuOptions], async (value, index) => {
                const custom_id = value.customId || `selection${index}`;
                if (custom_id === interaction.customId) {
                    if (value.onSelection)
                        await value.onSelection({ interaction, message: msg, data, collector });
                    await asyncForEach(value.options, async (option) => {
                        if (option.value === interaction.values[0])
                            await option.onSelect({ interaction, message: msg, data, collector });
                    });
                }
            });
            use++;
            if (settings.max && settings.max > 0 && use >= settings.max) {
                collector.emit("end", "");
            }
        }
    });

    return collector;
}

export interface MessageSelectData {
    sendTarget: Message | TextBasedChannel,
    author?: User | string,
    options?: string | MessageOptions,
    settings?: { max?: number, time?: number }
    selectMenuOptions: SelectMenuOptions[] | SelectMenuOptions
}

export interface SelectMenuOptions {
    customId?: string,
    placeholder?: string,
    onSelection?(interactionData: InteractionData): void,
    options: SelectOption[]
}

export interface SelectOption extends MessageSelectOptionData {
    onSelect(interactionData: InteractionData): void;
}