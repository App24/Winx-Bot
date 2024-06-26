import { ButtonStyle, TextInputStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";
import { ServerData } from "../../structs/databaseTypes/ServerData";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class MessageMaxLengthBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.set"), onRun: async ({ interaction }) => {
                        await createInteractionModal({
                            title: "Message Max Length",
                            fields: { custom_id: "length", required: true, style: TextInputStyle.Short, label: "Length", value: serverInfo.document.maxMessageLength.toString() },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction: submission }) {
                                const len = parseInt(data.information.length);
                                if (isNaN(len)) {
                                    return submission.reply(Localisation.getLocalisation("error.invalid.number"));
                                }
                                if (len < serverInfo.document.minMessageLength) return submission.reply(Localisation.getLocalisation("setmaxlength.error"));

                                serverInfo.document.maxMessageLength = len;
                                await serverInfo.save();
                                await submission.reply(Localisation.getLocalisation("setmaxlength.set", serverInfo.document.maxMessageLength));
                            },
                            filter: ({ data }) => {
                                const length = parseInt(data.information.length);
                                return !isNaN(length);
                            }
                        });
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.get"), onRun: async ({ interaction }) => {
                        interaction.editReply(Localisation.getLocalisation("setmaxlength.get", serverInfo.document.maxMessageLength));
                    }
                }
            ]
        });
    }
}