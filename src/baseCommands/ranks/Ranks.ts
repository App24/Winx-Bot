import { EmbedBuilder } from "discord.js";
import { Localisation } from "../../localisation";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { asyncForEach, createMessageEmbed, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class RanksBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ranks = await getDatabase(RankLevel, { guildId: cmdArgs.guildId });
        if (!ranks.length) return cmdArgs.reply("error.empty.ranks");
        const data = [];
        ranks.sort((a, b) => a.document.level - b.document.level);
        await asyncForEach(ranks, async (rank) => {
            data.push(Localisation.getTranslation("transformations.list", rank.document.level, `<@&${rank.document.roleId}>`));
        });
        const embed = new EmbedBuilder();
        embed.setTitle(Localisation.getTranslation("transformations.title"));
        embed.setDescription(data.join("\n"));
        cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }
}