import { ButtonStyle, TextInputStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";
import { ServerData } from "../../structs/databaseTypes/ServerData";

export class MessageMinLengthBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        await createInteractionModal({
                            title: "Message Min Length",
                            fields: { custom_id: "length", required: true, style: TextInputStyle.Short, label: "Length", value: serverInfo.document.minMessageLength.toString() },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction: submission }) {
                                const len = parseInt(data.information.length);
                                if (isNaN(len)) {
                                    return submission.reply(Localisation.getTranslation("error.invalid.number"));
                                }
                                if (len < serverInfo.document.maxMessageLength) return submission.reply(Localisation.getTranslation("setminlength.error"));

                                serverInfo.document.minMessageLength = len;
                                await serverInfo.save();
                                await submission.reply(Localisation.getTranslation("setmaxlength.set", serverInfo.document.minMessageLength));
                            },
                            filter: ({ data }) => {
                                const length = parseInt(data.information.length);
                                return !isNaN(length);
                            }
                        });
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
                        interaction.editReply(Localisation.getTranslation("setminlength.get", serverInfo.document.minMessageLength));
                    }
                }
            ]
        });
    }
}