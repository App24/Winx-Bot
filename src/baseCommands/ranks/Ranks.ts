import { EmbedBuilder } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getServerDatabase, asyncForEach, createMessageEmbed } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class RanksBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
        if (!ranks.length) return cmdArgs.reply("error.empty.ranks");
        const data = [];
        ranks.sort((a, b) => a.level - b.level);
        await asyncForEach(ranks, async (rank) => {
            data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
        });
        const embed = new EmbedBuilder();
        embed.setTitle(Localisation.getTranslation("transformations.title"));
        embed.setDescription(data.join("\n"));
        cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }
}