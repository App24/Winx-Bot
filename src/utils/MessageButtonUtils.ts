import { InteractionButtonOptions, InteractionCollector, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageOptions, TextBasedChannel, User } from "discord.js";
import { Localisation } from "../localisation";
import { asyncForEach } from "./Utils";

export async function createMessageButtons(messageButtonData: MessageButtonData) {
    const { sendTarget, author, options, beforeButton, buttons: _buttons } = messageButtonData;
    let { settings } = messageButtonData;

    const buttons = _buttons.filter((button) => !button.hidden);

    if (buttons.length > 15) buttons.splice(15, buttons.length - 15);

    const rows: MessageActionRow[] = [];
    for (let i = 0; i < Math.ceil(buttons.length / 5); i++) {
        rows.push(new MessageActionRow());
    }

    buttons.forEach((button, index) => {
        rows[Math.floor(index / 5)].addComponents(new MessageButton(button));
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

    let use = 0;

    if (settings.time && settings.time <= 0)
        settings.time = undefined;
    else if (!settings.time)
        settings.time = 1000 * 60 * 5;

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
        if (interaction.isButton()) {
            if (author && interaction.user.id !== authorId) {
                await interaction.reply({ ephemeral: true, content: Localisation.getTranslation("generic.not.author") });
                return;
            }
            if (beforeButton)
                await beforeButton({ interaction, message: msg, data, collector });
            await asyncForEach(_buttons, async (value) => {
                if (value.customId === interaction.customId) {
                    await value.onRun({ interaction, message: msg, data, collector });
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

export async function createGenericButtons(messageButtonData: MessageButtonData) {
    return createMessageButtons({ sendTarget: messageButtonData.sendTarget, options: messageButtonData.options, settings: messageButtonData.settings, beforeButton: messageButtonData.beforeButton, buttons: messageButtonData.buttons });
}

export async function createWhatToDoButtons(messageButtonData: MessageButtonData) {
    return createMessageButtons({ sendTarget: messageButtonData.sendTarget, author: messageButtonData.author, options: Localisation.getTranslation("generic.whattodo"), settings: messageButtonData.settings, beforeButton: messageButtonData.beforeButton, buttons: messageButtonData.buttons });
}

export interface MessageButtonData {
    sendTarget: Message | TextBasedChannel,
    author?: User | string,
    options?: string | MessageOptions,
    settings?: { max?: number, time?: number },
    beforeButton?: (interactionData: InteractionData) => void,
    buttons: InteractiveButton[]
}

export interface InteractionData {
    interaction: MessageComponentInteraction,
    message: Message,
    data: { information },
    collector: InteractionCollector<MessageComponentInteraction>;
}

export interface InteractiveButton extends InteractionButtonOptions {
    onRun(interactionData: InteractionData): void;
    hidden?: boolean;
}