import { ChannelType } from "discord.js";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SpookyCategory } from "../../structs/databaseTypes/SpookyCategory";
import { getCategoryById } from "../../utils/GetterUtils";
import { asyncForEach, asyncMapForEach, getServerDatabase, removeEmojis } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SpookifyBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const SpookyCategories = BotUser.getDatabase(DatabaseType.SpookyCategories);

        if (cmdArgs.args[0] === "start") {
            const categories = cmdArgs.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);

            const spookyEmojis = ["👻", "🦇", "🧝‍♀️", "🧝‍♂️", "🔮", "👿", "🕸", "🍭", "🩸", "⚰", "🧚‍♀️", "🧚‍♂️", "🧟‍♀️", "🧟‍♂️"];

            const spookyCategories: SpookyCategory[] = [];

            await asyncMapForEach(categories, async (_, cat) => {
                const id = cat.id;
                const oldName = cat.name;
                const noEmoji = removeEmojis(cat.name);
                const emoji = spookyEmojis[Math.floor(Math.random() * spookyEmojis.length)];
                const newName = `${emoji} ${noEmoji} ${emoji}`;
                spookyCategories.push({ id: id, originalName: oldName, spookyName: newName });
                await cat.setName(newName);
            });

            await SpookyCategories.set(cmdArgs.guildId, spookyCategories);

            cmdArgs.reply("generic.done");
        } else if (cmdArgs.args[0] === "save") {
            const categories = cmdArgs.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);

            const spookyCategories: SpookyCategory[] = await getServerDatabase(SpookyCategories, cmdArgs.guildId);

            categories.forEach(cat => {
                const category = spookyCategories.find(c => c.id === cat.id);
                if (category) {
                    category.spookyName = cat.name;
                }
            });

            await SpookyCategories.set(cmdArgs.guildId, spookyCategories);

            cmdArgs.reply("generic.done");
        } else if (cmdArgs.args[0] === "revert") {
            const spookyCategories: SpookyCategory[] = await getServerDatabase(SpookyCategories, cmdArgs.guildId);

            await asyncForEach(spookyCategories, async (cat) => {
                const category = await getCategoryById(cat.id, cmdArgs.guild);
                if (category) {
                    await category.setName(cat.originalName);
                }
            });

            cmdArgs.reply("generic.done");
        } else {
            cmdArgs.reply("error.generic");
        }
    }
}