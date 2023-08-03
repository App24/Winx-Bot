import { Guild } from "discord.js";
import { Localisation } from "../../localisation";
import { RankLevel, RankLevelData } from "../../structs/databaseTypes/RankLevel";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { getRoleById } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getCurrentRank, getPreviousRanks } from "../../utils/RankUtils";
import { asyncForEach, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { Document, Types } from "mongoose";
import { ModelWrapper } from "../../structs/ModelWrapper";

export class WingsLevelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        const userLevel = await getOneDatabase(UserLevel, { guildId: cmdArgs.guildId, "levelData.userId": cmdArgs.author.id }, () => new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: cmdArgs.author.id } }));

        const currentRank = await getCurrentRank(userLevel.document.levelData.level, cmdArgs.guildId);

        if (currentRank.isNull()) {
            return cmdArgs.reply("error.rank.none");
        }

        const previousRanks = await getPreviousRanks(userLevel.document.levelData.level, cmdArgs.guildId);

        previousRanks.push(currentRank);

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options: await this.updateWings(userSettings, cmdArgs.guild, previousRanks.filter(r => !r.isNull()))
            }
        });
    }

    async updateWings(userSettings: ModelWrapper<typeof ServerUserSettings.schema>, guild: Guild, previousRanks: ModelWrapper<typeof RankLevel.schema>[]) {
        const options: SelectOption[] = [];

        const setWingsLevel = async (level: number) => {
            userSettings.document.wingsLevel = level;
            await userSettings.save();
        };

        const isDefault = (level: number) => {
            return userSettings.document.wingsLevel === level;
        };

        options.push({
            label: Localisation.getTranslation("generic.automatic"),
            value: "-1",
            default: isDefault(-1),
            onSelect: async ({ interaction }) => {
                setWingsLevel(-1);
                interaction.reply(Localisation.getTranslation("wingslevel.set", "automatic"));
            },
            description: null,
            emoji: null
        });

        await asyncForEach(previousRanks, async (rank) => {
            const role = await getRoleById(rank.document.roleId, guild);
            if (!role)
                return;
            options.push({
                label: role.name,
                value: rank.document.level.toString(),
                default: isDefault(rank.document.level),
                onSelect: async ({ interaction }) => {
                    setWingsLevel(rank.document.level);
                    interaction.reply(Localisation.getTranslation("wingslevel.set", role.name));
                },
                description: null,
                emoji: null
            });
        });

        return options;
    }
}