import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailable } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { getRoleById } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getCurrentRank, getPreviousRanks, getUserLevel } from "../../utils/RankUtils";
import { asyncForEach, getServerDatabase } from "../../utils/Utils";

class WingsLevelCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["wingslevels", "wingselect", "wingsselect"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        const userLevel = await getUserLevel(cmdArgs.author.id, cmdArgs.guildId);

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);

        if (!currentRank) {
            return cmdArgs.message.reply(Localisation.getTranslation("error.rank.none"));
        }

        const previousRanks = await getPreviousRanks(userLevel.level, cmdArgs.guildId);

        previousRanks.push(currentRank);

        const options: SelectOption[] = [];

        options.push({
            label: Localisation.getTranslation("generic.automatic"),
            value: "-1",
            default: userSettings.wingsLevel < 0,
            onSelect: async ({ interaction }) => {
                setWingsLevel(-1);
                interaction.reply(Localisation.getTranslation("wingslevel.set", "automatic"));
            }
        });

        async function setWingsLevel(level: number) {
            userSettings.wingsLevel = level;
            serverUserSettings[userIndex] = userSettings;
            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
        }

        await asyncForEach(previousRanks, async (rank) => {
            const role = await getRoleById(rank.roleId, cmdArgs.guild);
            if (!role)
                return;
            options.push({
                label: role.name,
                value: rank.level.toString(),
                default: userSettings.wingsLevel === rank.level,
                onSelect: async ({ interaction }) => {
                    setWingsLevel(rank.level);
                    interaction.reply(Localisation.getTranslation("wingslevel.set", role.name));
                }
            });
        });

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: [
                {
                    customId: "selection",
                    placeholder: Localisation.getTranslation("generic.selectmenu.placeholder"),
                    options: options
                }
            ]
        });
    }
}

export = WingsLevelCommand;