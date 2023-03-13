import { BaseGuildTextChannel, EmbedBuilder, TextChannel, ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionStruct, SuggestionState } from "../../structs/databaseTypes/SuggestionStruct";
import { getTextChannelById, getGuildById, getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { isDM, genRanHex } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SuggestBaseCommand extends BaseCommand{
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

        await createMessageButtons({
            sendTarget: <TextChannel>channel, author: process.env.OWNER_ID, options: { embeds: [embed] }, settings: { max: 1, time: -1 }, buttons: [
                {
                    customId: "accept", style: ButtonStyle.Success, label: Localisation.getTranslation("button.accept"), onRun: async ({ interaction, message }) => {
                        const embed = EmbedBuilder.from(message.embeds[0]);
                        embed.setTitle(Localisation.getTranslation("generic.accepted"));
                        interaction.update({ embeds: [embed], components: [] });
                        const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
                        let hex = genRanHex(16);
                        let suggestions = await Suggestions.get(hex);
                        while (suggestions) {
                            hex = genRanHex(16);
                            suggestions = await Suggestions.get(hex);
                        }
                        const suggestion = new SuggestionStruct();

                        suggestion.userId = user.id;
                        suggestion.request = request;
                        suggestion.state = SuggestionState.Non;

                        await Suggestions.set(hex, suggestion);
                    }
                },
                {
                    customId: "deny", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.deny"), onRun: async ({ interaction, message }) => {
                        const embed = EmbedBuilder.from(message.embeds[0]);
                        embed.setTitle(Localisation.getTranslation("generic.rejected"));
                        interaction.update({ embeds: [embed], components: [] });
                    }
                }
            ]
        });
    }
}