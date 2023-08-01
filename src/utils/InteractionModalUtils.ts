import { APITextInputComponent, ActionRowBuilder, CollectorFilter, CommandInteraction, MessageComponentInteraction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder } from "discord.js";

export async function createInteractionModal(modalData: ModalData) {
    const { sendTarget, fields, title, onSubmit, filter } = modalData;

    const optionsList = (Array.isArray(fields) ? fields : [fields]);

    const rows: ActionRowBuilder<TextInputBuilder>[] = [];
    for (let i = 0; i < optionsList.length; i++) {
        rows.push(new ActionRowBuilder({ components: [new TextInputBuilder(optionsList[i])] }));
    }

    const modal = new ModalBuilder({ custom_id: "modal", components: rows, title: title });

    await sendTarget.showModal(modal);
    const submission = await sendTarget.awaitModalSubmit({
        time: 1000 * 5 * 60, filter: (interaction) => {
            const value = interaction.user.id === sendTarget.user.id;

            if (filter !== undefined) {

                const data = { information: {} };

                for (let i = 0; i < optionsList.length; i++) {
                    const value = interaction.fields.getTextInputValue(optionsList[i].custom_id);
                    data.information[optionsList[i].custom_id] = value;
                }

                return value && filter({ interaction, data });
            }
            return value;
        }
    });

    const data = { information: {} };

    for (let i = 0; i < optionsList.length; i++) {
        const value = submission.fields.getTextInputValue(optionsList[i].custom_id);
        data.information[optionsList[i].custom_id] = value;
    }

    onSubmit({ data, interaction: submission });
}

export interface ModalData {
    sendTarget: MessageComponentInteraction | CommandInteraction,
    fields: Partial<ModalFieldData>[] | Partial<ModalFieldData>,
    title: string,
    onSubmit(interaction: ModalInteraction): void,
    filter?: CollectorFilter<[ModalInteraction]>
}

export interface ModalFieldData extends APITextInputComponent {
    _?
}

export interface ModalInteraction {
    interaction: ModalSubmitInteraction,
    data: { information }
}