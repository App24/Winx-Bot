import { RanksBaseCommand } from "../../baseCommands/ranks/Ranks";
import { Rank } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class RanksCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Rank;
        this.aliases = ["ranks"];

        this.baseCommand = new RanksBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
        if (!ranks.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));
        const data = [];
        ranks.sort((a, b) => a.level - b.level);
        await asyncForEach(ranks, async (rank) => {
            data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
        });
        const embed = new EmbedBuilder();
        embed.setTitle(Localisation.getTranslation("transformations.title"));
        embed.setDescription(data.join("\n"));
        cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }*/
}

export = RanksCommand;