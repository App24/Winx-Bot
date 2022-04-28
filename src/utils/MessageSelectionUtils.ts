import { Message, TextBasedChannel, User, MessageEmbed, MessageSelectOptionData, MessageActionRow, MessageSelectMenu, MessageComponentInteraction } from "discord.js";
import { Localisation } from "../localisation";
import { InteractionData } from "./MessageButtonUtils";
import { asyncForEach } from "./Utils";

export async function createMessageSelection(messageSelectData: MessageSelectData) {
    const { sendTarget, author, text, selectMenuOptions } = messageSelectData;
    let { settings } = messageSelectData;

    if (selectMenuOptions.length > 5) selectMenuOptions.splice(5, selectMenuOptions.length - 5);

    const rows: MessageActionRow[] = [];
    for (let i = 0; i < selectMenuOptions.length; i++) {
        rows.push(new MessageActionRow());
    }

    selectMenuOptions.forEach((selectMenu, index) => {
        rows[index].addComponents(new MessageSelectMenu({ custom_id: selectMenu.customId, placeholder: selectMenu.placeholder, options: selectMenu.options }));
    });

    let msg: Message<boolean>;

    const sendMessage = sendTarget instanceof Message ? sendTarget.reply.bind(sendTarget) : sendTarget.send.bind(sendTarget);

    if (typeof text === "string")
        msg = await sendMessage({ content: text, components: rows });
    else
        msg = await sendMessage({ embeds: text, components: rows });

    let authorId: string;

    if (author)
        authorId = (typeof author === "string" ? author : author.id);

    if (!settings) {
        settings = { max: Number.MAX_SAFE_INTEGER, time: 1000 * 60 * 5 };
    }

    if (!settings.time) settings.time = 1000 * 60 * 5;

    let use = 0;

    const collector = msg.createMessageComponentCollector({ filter: (i: MessageComponentInteraction) => i === i, time: settings.time });

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
            await asyncForEach(selectMenuOptions, async (value) => {
                if (value.customId === interaction.customId) {
                    if (value.onSelection)
                        value.onSelection({ interaction, message: msg, data, collector });
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
    text?: string | MessageEmbed[],
    settings?: { max?: number, time?: number }
    selectMenuOptions: SelectMenuOptions[]
}

export interface SelectMenuOptions {
    customId: string,
    placeholder?: string,
    onSelection?(interactionData: InteractionData): void,
    options: SelectOption[]
}

export interface SelectOption extends MessageSelectOptionData {
    onSelect(interactionData: InteractionData): void;
}