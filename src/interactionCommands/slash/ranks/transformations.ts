import { ApplicationCommandType } from "discord.js";
import { RanksBaseCommand } from "../../../baseCommands/ranks/Ranks";
import { SlashCommand } from "../../../structs/SlashCommand";

class RanksCommand extends SlashCommand {
    public constructor() {
        super({ name: "", description: "Shows the transformations available!", type: ApplicationCommandType.ChatInput, dmPermission: false });

        this.baseCommand = new RanksBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
        if (!ranks.length) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.empty.ranks"));
        const data = [];
        ranks.sort((a, b) => a.level - b.level);
        await asyncForEach(ranks, async (rank) => {
            data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
        });
        const embed = new EmbedBuilder();
        embed.setTitle(Localisation.getTranslation("transformations.title"));
        embed.setDescription(data.join("\n"));
        cmdArgs.interaction.followUp({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }*/
}

export = RanksCommand;