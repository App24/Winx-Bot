import { Localisation } from "../../localisation";
import { ServerData } from "../../structs/databaseTypes/ServerData";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class WingsRequestChannelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getLocalisation("button.get"),
                        value: "get",
                        async onSelect({ interaction }) {
                            if (!serverInfo.document.wingsRequestChannel) {
                                return interaction.reply("No Wings Request Channel Set");
                            }
                            return interaction.reply(`<#${serverInfo.document.wingsRequestChannel}>`);
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.set"),
                        value: "set",
                        async onSelect({ interaction }) {
                            const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!channel) return;

                            serverInfo.document.wingsRequestChannel = channel.id;

                            await serverInfo.save();

                            msg.reply(Localisation.getLocalisation("generic.done"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.clear"),
                        value: "clear",
                        async onSelect({ interaction }) {
                            serverInfo.document.wingsRequestChannel = "";

                            await serverInfo.save();

                            interaction.reply(Localisation.getLocalisation("generic.done"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    }
                ]
            }
        });
    }
}