import { ButtonStyle, TextInputStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerData } from "../../structs/databaseTypes/ServerInfo";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getNumberReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";

export class MessageMinLengthBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        await createInteractionModal({
                            title: "Message Min Length",
                            fields: { custom_id: "length", required: true, style: TextInputStyle.Short, label: "Length", value: serverInfo.minMessageLength.toString() },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction: submission }) {
                                const len = parseInt(data.information.length);
                                if (isNaN(len)) {
                                    return submission.reply(Localisation.getTranslation("error.invalid.number"));
                                }
                                if (len < serverInfo.maxMessageLength) return submission.reply(Localisation.getTranslation("setminlength.error"));

                                serverInfo.minMessageLength = len;
                                await ServerInfo.set(cmdArgs.guildId, serverInfo);
                                await submission.reply(Localisation.getTranslation("setmaxlength.set", serverInfo.minMessageLength));
                            },
                            filter: ({ interaction, data }) => {
                                const length = parseInt(data.information.length);
                                return !isNaN(length);
                            }
                        });
                        /*const { value: len, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
                        if (!len) return;
                        if (len > serverInfo.maxMessageLength) return msg.reply(Localisation.getTranslation("setminlength.error"));
                        serverInfo.minMessageLength = len;
                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                        msg.reply(Localisation.getTranslation("setminlength.set", serverInfo.minMessageLength));*/
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
                        interaction.editReply(Localisation.getTranslation("setminlength.get", serverInfo.minMessageLength));
                    }
                }
            ]
        });
    }
}