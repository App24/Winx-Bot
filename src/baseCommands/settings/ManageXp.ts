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

export class ManageXpBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        await createInteractionModal({
                            title: "XP per Message",
                            fields: { custom_id: "xp", required: true, style: TextInputStyle.Short, label: "XP", value: serverInfo.maxXpPerMessage.toString() },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction: submission }) {
                                const xp = parseInt(data.information.xp);
                                if (isNaN(xp)) {
                                    return submission.reply(Localisation.getTranslation("error.invalid.number"));
                                }

                                serverInfo.maxXpPerMessage = xp;
                                await ServerInfo.set(cmdArgs.guildId, serverInfo);
                                await submission.reply(Localisation.getTranslation("setxp.set", serverInfo.maxXpPerMessage));
                            },
                            filter: ({ interaction, data }) => {
                                const xp = parseInt(data.information.xp);
                                return !isNaN(xp);
                            }
                        });

                        /*const { value: xp, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
                        if (!xp) return;
                        serverInfo.maxXpPerMessage = xp;
                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                        msg.reply(Localisation.getTranslation("setxp.set", serverInfo.maxXpPerMessage));*/
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
                        interaction.update({ content: Localisation.getTranslation("setxp.get", serverInfo.maxXpPerMessage) });
                    }
                }
            ]
        });
    }
}