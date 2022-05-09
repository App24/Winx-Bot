import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getBotRoleColor, getUserById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionStruct, SuggestionState } from "../../structs/databaseTypes/SuggestionStruct";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach } from "../../utils/Utils";
import { capitalise } from "../../utils/FormatUtils";

class SuggestionsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.usage = [new CommandUsage(true, "argument.list", "argument.complete", "argument.reject", "argument.get"), new CommandUsage(false, "argument.requestid", "argument.rejected", "argument.completed", "argument.non")];
        this.category = Owner;
        this.subCommands = [new ListSubCommand(), new CompleteSubCommand(), new RejectSubCommand(), new GetSubCommand()];
    }

    public onRun(cmdArgs: CommandArguments) {
        const name = cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class ListSubCommand extends SubCommand {
    public constructor() {
        super("list");
        this.maxArgs = 1;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
        const requests: { key: string, value: SuggestionStruct }[] = await Suggestions.entries();
        let suggestionState: SuggestionState = undefined;
        if (cmdArgs.args[0]) {
            switch (cmdArgs.args[0].toLowerCase()) {
                case "non":
                    suggestionState = SuggestionState.Non;
                    break;
                case "completed":
                    suggestionState = SuggestionState.Completed;
                    break;
                case "rejected":
                    suggestionState = SuggestionState.Rejected;
                    break;
            }
        }

        const data = [];
        await asyncForEach(requests, async (request: { key: string, value: SuggestionStruct }) => {
            const key = request.key;
            const suggestion = request.value;
            if (suggestionState === undefined || suggestionState === suggestion.state) {
                const user = await getUserById(suggestion.userId);
                data.push(Localisation.getTranslation("suggestions.list.suggestion", key, user || suggestion.userId, capitalise(suggestion.state)));
            }
        });

        if (!data.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.suggestions"));

        const embed = new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data.join("\n"));
        cmdArgs.message.reply({ embeds: [embed] });
    }
}

class CompleteSubCommand extends SubCommand {
    public constructor() {
        super("complete");

        this.minArgs = 1;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion: SuggestionStruct = await Suggestions.get(cmdArgs.args[0].toLowerCase());
        if (!suggestion) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        if (suggestion.state === SuggestionState.Completed) return cmdArgs.message.reply(Localisation.getTranslation("suggestions.already.completed"));
        const user = await getUserById(suggestion.userId);
        const text = Localisation.getTranslation("suggestions.complete", user || suggestion.userId, suggestion.request);
        const embed = new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag || suggestion.userId, user.displayAvatarURL() || "");
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton({ customId: "complete", style: "SUCCESS", label: Localisation.getTranslation("button.confirm") }),
                new MessageButton({ customId: "cancel", style: "SECONDARY", label: Localisation.getTranslation("button.cancel") })
            );

        cmdArgs.message.reply({ embeds: [embed], components: [row] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (interaction) => interaction.user.id === cmdArgs.author.id, max: 1 });

            collector.on("collect", async (interaction: ButtonInteraction) => {
                await interaction.update({ components: [] });
                if (interaction.customId === "complete") {
                    const embed = msg.embeds[0];
                    embed.setDescription(Localisation.getTranslation("suggestions.completed", embed.description));
                    interaction.editReply({ embeds: [embed] });
                    suggestion.state = SuggestionState.Completed;
                    await Suggestions.set(cmdArgs.args[0], suggestion);
                }
            });
        });
    }
}

class RejectSubCommand extends SubCommand {
    public constructor() {
        super("reject");

        this.minArgs = 1;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion: SuggestionStruct = await Suggestions.get(cmdArgs.args[0].toLowerCase());
        if (!suggestion) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        if (suggestion.state === SuggestionState.Rejected) return cmdArgs.message.reply(Localisation.getTranslation("suggestions.already.rejected"));
        const user = await getUserById(suggestion.userId);
        const text = Localisation.getTranslation("suggestions.reject", user || suggestion.userId, suggestion.request);
        const embed = new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag || suggestion.userId, user.displayAvatarURL() || "");
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton({ customId: "reject", style: "SUCCESS", label: Localisation.getTranslation("button.confirm") }),
                new MessageButton({ customId: "cancel", style: "SECONDARY", label: Localisation.getTranslation("button.cancel") })
            );

        cmdArgs.message.reply({ embeds: [embed], components: [row] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (interaction) => interaction.user.id === cmdArgs.author.id, max: 1 });

            collector.on("collect", async (interaction: ButtonInteraction) => {
                await interaction.update({ components: [] });
                if (interaction.customId === "reject") {
                    const embed = msg.embeds[0];
                    embed.setDescription(Localisation.getTranslation("suggestions.rejected", embed.description));
                    interaction.editReply({ embeds: [embed] });
                    suggestion.state = SuggestionState.Rejected;
                    await Suggestions.set(cmdArgs.args[0], suggestion);
                }
            });
        });
    }
}

class GetSubCommand extends SubCommand {
    public constructor() {
        super("get");

        this.minArgs = 1;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Suggestions = BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion: SuggestionStruct = await Suggestions.get(cmdArgs.args[0].toLowerCase());
        if (!suggestion) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        const user = await getUserById(suggestion.userId);
        const text = Localisation.getTranslation("suggestions.suggestion", user || suggestion.userId, capitalise(suggestion.state), suggestion.request);
        const embed = new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag || suggestion.userId, user.displayAvatarURL() || "");
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        cmdArgs.message.reply({ embeds: [embed] });
    }
}

export = SuggestionsCommand;