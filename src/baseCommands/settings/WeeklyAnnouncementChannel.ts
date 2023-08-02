import { Localisation } from "../../localisation";
import { ServerData } from "../../structs/databaseTypes/ServerData";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class WeeklyAnnouncementChannelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        async onSelect({ interaction }) {
                            if (!serverInfo.weeklyLeaderboardAnnouncementChannel) {
                                return interaction.reply("No Weekly Top Announcement Channel Set");
                            }
                            return interaction.reply(`<#${serverInfo.weeklyLeaderboardAnnouncementChannel}>`);
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

                            serverInfo.weeklyLeaderboardAnnouncementChannel = channel.id;

                            await serverInfo.save();

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
                            serverInfo.weeklyLeaderboardAnnouncementChannel = "";

                            await serverInfo.save();

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