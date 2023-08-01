import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerData } from "../../structs/databaseTypes/ServerInfo";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class WeeklyAnnouncementChannelBaseCommand extends BaseCommand {
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
                            if (!serverInfo.weeklyAnnoucementChannel) {
                                return interaction.reply("No Weekly Top Announcement Channel Set");
                            }
                            return interaction.reply(`<#${serverInfo.weeklyAnnoucementChannel}>`);
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

                            serverInfo.weeklyAnnoucementChannel = channel.id;

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
                            serverInfo.weeklyAnnoucementChannel = "";

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