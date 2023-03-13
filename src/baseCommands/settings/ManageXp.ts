import { ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getNumberReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ManageXpBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        const { value: xp, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
                        if (!xp) return;
                        serverInfo.maxXpPerMessage = xp;
                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                        msg.reply(Localisation.getTranslation("setxp.set", serverInfo.maxXpPerMessage));
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
                        interaction.editReply(Localisation.getTranslation("setxp.get", serverInfo.maxXpPerMessage));
                    }
                }
            ]
        });
    }
}