import { BaseGuildTextChannel, EmbedBuilder, TextChannel, ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { getTextChannelById, getGuildById, getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { isDM, genRanHex } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { SuggestionData, SuggestionState } from "../../structs/databaseTypes/SuggestionStruct";

export class SuggestBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const suggestionsChannel: any = await BotUser.channels.fetch(process.env.SUGGESTION_CHANNEL);
        let channel: BaseGuildTextChannel;
        if (!isDM(cmdArgs.channel) && suggestionsChannel.guildId === cmdArgs.guildId) {
            channel = await getTextChannelById(process.env.SUGGESTION_CHANNEL, cmdArgs.guild);
        } else {
            channel = await getTextChannelById(process.env.SUGGESTION_CHANNEL, await getGuildById(suggestionsChannel.guildId));
        }
        const user = cmdArgs.author;
        const request = cmdArgs.args.join(" ");
        const text = Localisation.getTranslation("suggestion.request", user, request);
        const embed = new EmbedBuilder();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter({ text: user.tag, iconURL: user.displayAvatarURL() });
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        cmdArgs.reply("generic.sent");

        let hex: string;
        do {
            hex = genRanHex(16);
        } while ((await SuggestionData.count({ key: hex })) > 0);
        const suggestion = new SuggestionData({ key: hex, userId: user.id, request });

        await suggestion.save();

        await createMessageButtons({
            sendTarget: <TextChannel>channel, author: process.env.OWNER_ID, options: { embeds: [embed] }, settings: { max: 1, time: -1 }, buttons: [
                {
                    customId: "accept", style: ButtonStyle.Success, label: Localisation.getTranslation("button.accept"), onRun: async ({ interaction, message }) => {
                        const embed = EmbedBuilder.from(message.embeds[0]);
                        embed.setTitle(Localisation.getTranslation("generic.accepted"));
                        interaction.update({ embeds: [embed], components: [] });

                        suggestion.state = SuggestionState.Accepted;

                        await suggestion.save();
                    }
                },
                {
                    customId: "deny", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.deny"), onRun: async ({ interaction, message }) => {
                        const embed = EmbedBuilder.from(message.embeds[0]);
                        embed.setTitle(Localisation.getTranslation("generic.rejected"));
                        interaction.update({ embeds: [embed], components: [] });

                        suggestion.state = SuggestionState.Rejected;

                        await suggestion.save();
                    }
                }
            ]
        });
    }
}