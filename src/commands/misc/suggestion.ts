import { Command, CommandUsage } from "../../structs/Command";
import { SuggestBaseCommand } from "../../baseCommands/misc/Suggest";

class SuggestionCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(true, "argument.suggestion")];
        this.aliases = ["suggest"];

        this.baseCommand = new SuggestBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const suggestionsChannel: any = await BotUser.channels.fetch(process.env.SUGGESTION_CHANNEL);
    //     let channel: BaseGuildTextChannel;
    //     if (!isDM(cmdArgs.channel) && suggestionsChannel.guildId === cmdArgs.guildId) {
    //         channel = await getTextChannelById(process.env.SUGGESTION_CHANNEL, cmdArgs.guild);
    //     } else {
    //         channel = await getTextChannelById(process.env.SUGGESTION_CHANNEL, await getGuildById(suggestionsChannel.guildId));
    //     }
    //     const user = cmdArgs.author;
    //     const request = cmdArgs.args.join(" ");
    //     const text = Localisation.getTranslation("suggestion.request", user, request);
    //     const embed = new EmbedBuilder();
    //     embed.setDescription(text);
    //     embed.setTimestamp();
    //     embed.setFooter({ text: user.tag, iconURL: user.displayAvatarURL() });
    //     embed.setColor((await getBotRoleColor(cmdArgs.guild)));
    //     cmdArgs.message.reply(Localisation.getTranslation("generic.sent"));

    //     await createMessageButtons({
    //         sendTarget: <TextChannel>channel, author: process.env.OWNER_ID, options: { embeds: [embed] }, settings: { max: 1, time: -1 }, buttons: [
    //             {
    //                 customId: "accept", style: ButtonStyle.Success, label: Localisation.getTranslation("button.accept"), onRun: async ({ interaction, message }) => {
    //                     const embed = EmbedBuilder.from(message.embeds[0]);
    //                     embed.setTitle(Localisation.getTranslation("generic.accepted"));
    //                     interaction.update({ embeds: [embed], components: [] });
    //                     const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
    //                     let hex = genRanHex(16);
    //                     let suggestions = await Suggestions.get(hex);
    //                     while (suggestions) {
    //                         hex = genRanHex(16);
    //                         suggestions = await Suggestions.get(hex);
    //                     }
    //                     const suggestion = new SuggestionStruct();

    //                     suggestion.userId = user.id;
    //                     suggestion.request = request;
    //                     suggestion.state = SuggestionState.Non;

    //                     await Suggestions.set(hex, suggestion);
    //                 }
    //             },
    //             {
    //                 customId: "deny", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.deny"), onRun: async ({ interaction, message }) => {
    //                     const embed = EmbedBuilder.from(message.embeds[0]);
    //                     embed.setTitle(Localisation.getTranslation("generic.rejected"));
    //                     interaction.update({ embeds: [embed], components: [] });
    //                 }
    //             }
    //         ]
    //     });
    // }
}

export = SuggestionCommand;