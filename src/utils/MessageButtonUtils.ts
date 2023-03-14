import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, CommandInteraction, ComponentType, GuildMember, InteractionButtonComponentData, InteractionCollector, Message, MessageActionRowComponentBuilder, MessageComponentInteraction, MessageOptions, SelectMenuInteraction, TextBasedChannel, User } from "discord.js";
import { Localisation } from "../localisation";
import { asyncForEach } from "./Utils";

export async function createMessageButtons(messageButtonData: MessageButtonData) {
    const { sendTarget, author, beforeButton, buttons: _buttons } = messageButtonData;
    let { settings, options } = messageButtonData;

    const buttons = _buttons.filter((button) => !button.hidden);

    if (buttons.length > 15) buttons.splice(15, buttons.length - 15);

    const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
    for (let i = 0; i < Math.ceil(buttons.length / 5); i++) {
        rows.push(new ActionRowBuilder());
    }

    buttons.forEach((button, index) => {
        // rows[Math.floor(index / 5)].addComponents(new ButtonComponent(button));
        button.type = ComponentType.Button;
        rows[Math.floor(index / 5)].addComponents(new ButtonBuilder(button));
    });

    let msg: Message<boolean>;

    let sendMessage;

    if (sendTarget instanceof Message || sendTarget instanceof MessageComponentInteraction || sendTarget instanceof CommandInteraction) {
        sendMessage = sendTarget.reply.bind(sendTarget);
        if (sendTarget instanceof MessageComponentInteraction || sendTarget instanceof CommandInteraction) {
            if (!sendTarget.deferred && !sendTarget.replied) {
                if (sendTarget instanceof MessageComponentInteraction) {
                    await sendTarget.deferUpdate();
                } else {
                    await sendTarget.deferReply();
                }
            }
            sendMessage = sendTarget.followUp.bind(sendTarget);
        }
    } else {
        sendMessage = sendTarget.send.bind(sendTarget);
    }

    //const sendMessage = sendTarget instanceof Message ? sendTarget.reply.bind(sendTarget) : sendTarget.send.bind(sendTarget);

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

    let use = 0;

    if (settings.time && settings.time <= 0)
        settings.time = undefined;
    else if (!settings.time)
        settings.time = 1000 * 60 * 5;

    const collector = msg.createMessageComponentCollector({ filter: () => true, time: settings.time });

    collector.on("end", () => {
        const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
        msg.components.forEach(component => {
            const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();
            component.components.forEach(c => {
                if (c.type === ComponentType.Button) {
                    row.addComponents(ButtonBuilder.from(c).setDisabled(true));
                }
            });
            components.push(row);
        });
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

export type SendTarget = Message | TextBasedChannel | MessageComponentInteraction | CommandInteraction;
export type MessageAuthor = GuildMember | User | string;

export interface MessageButtonData {
    sendTarget: SendTarget,
    author?: MessageAuthor,
    options?: string | MessageOptions,
    settings?: { max?: number, time?: number },
    beforeButton?: (interactionData: InteractionData) => void,
    buttons: Partial<InteractiveButton>[]
}

export interface InteractionData {
    interaction: MessageComponentInteraction,
    message: Message,
    data: { information },
    collector: InteractionCollector<ButtonInteraction | SelectMenuInteraction>;
}

export interface InteractiveButton extends InteractionButtonComponentData {
    onRun(interactionData: InteractionData): void;
    hidden?: boolean;
}