import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerData } from "../../structs/databaseTypes/ServerInfo";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class WingsRequestChannelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        async onSelect({ interaction }) {
                            if (!serverInfo.wingsRequestChannel) {
                                return interaction.reply("No Wings Request Channel Set");
                            }
                            return interaction.reply(`<#${serverInfo.wingsRequestChannel}>`);
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        async onSelect({ interaction }) {
                            const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!channel) return;

                            serverInfo.wingsRequestChannel = channel.id;

                            ServerInfo.set(cmdArgs.guildId, serverInfo);

                            msg.reply(Localisation.getTranslation("generic.done"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.clear"),
                        value: "clear",
                        async onSelect({ interaction }) {
                            serverInfo.wingsRequestChannel = "";

                            ServerInfo.set(cmdArgs.guildId, serverInfo);

                            interaction.reply(Localisation.getTranslation("generic.done"));
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