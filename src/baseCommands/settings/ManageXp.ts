import { ButtonStyle, TextInputStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";
import { ServerData } from "../../structs/databaseTypes/ServerData";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class ManageXpBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.set"), onRun: async ({ interaction }) => {
                        await createInteractionModal({
                            title: "XP per Message",
                            fields: { custom_id: "xp", required: true, style: TextInputStyle.Short, label: "XP", value: serverInfo.document.maxXpPerMessage.toString() },
                            sendTarget: interaction,
                            async onSubmit({ data, interaction: submission }) {
                                const xp = parseInt(data.information.xp);
                                if (isNaN(xp)) {
                                    return submission.reply(Localisation.getLocalisation("error.invalid.number"));
                                }

                                serverInfo.document.maxXpPerMessage = xp;
                                await serverInfo.save();
                                await submission.reply(Localisation.getLocalisation("setxp.set", serverInfo.document.maxXpPerMessage));
                            },
                            filter: ({ data }) => {
                                const xp = parseInt(data.information.xp);
                                return !isNaN(xp);
                            }
                        });
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.get"), onRun: async ({ interaction }) => {
                        interaction.update({ content: Localisation.getLocalisation("setxp.get", serverInfo.document.maxXpPerMessage) });
                    }
                }
            ]
        });
    }
}