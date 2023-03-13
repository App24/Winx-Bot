import { Guild } from "discord.js";
import { WingsLevelBaseCommand } from "../../baseCommands/customisation/WingsLevel";
import { BotUser } from "../../BotClient";
import { Keyv } from "../../keyv/keyv-index";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
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

        this.baseCommand = new WingsLevelBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
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

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: "Primary Wings",
                            value: "wings_a",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("WINGS_A", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, previousRanks)
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        },
                        {
                            label: "Secondary Wings",
                            value: "wings_b",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("WINGS_B", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, previousRanks)
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        },
                        {
                            label: "Both Wings",
                            value: "both",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("BOTH", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, previousRanks)
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        }
                    ]
            }
        });
    }

    async updateWings(setType: "WINGS_A" | "WINGS_B" | "BOTH", ServerUserSettingsDatabase: Keyv, serverUserSettings: ServerUserSettings[], userSettings: ServerUserSettings, userIndex: number, guild: Guild, previousRanks: RankLevel[]) {
        const options: SelectOption[] = [];

        const setWingsLevel = async (level: number) => {
            if (setType === "WINGS_A" || setType === "BOTH") {
                userSettings.wingsLevel = level;
            }
            if (setType === "WINGS_B" || setType === "BOTH") {
                userSettings.wingsLevelB = level;
            }
            serverUserSettings[userIndex] = userSettings;
            await ServerUserSettingsDatabase.set(guild.id, serverUserSettings);
        };

        const isDefault = (level: number) => {
            if (setType === "WINGS_A") {
                return userSettings.wingsLevel === level;
            } else if (setType === "WINGS_B") {
                return userSettings.wingsLevelB === level;
            }

            const wingsA = userSettings.wingsLevel;
            const wingsB = userSettings.wingsLevelB;

            if (wingsA === level)
                return wingsA === wingsB;
            return false;
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
            const role = await getRoleById(rank.roleId, guild);
            if (!role)
                return;
            options.push({
                label: role.name,
                value: rank.level.toString(),
                default: isDefault(rank.level),
                onSelect: async ({ interaction }) => {
                    setWingsLevel(rank.level);
                    interaction.reply(Localisation.getTranslation("wingslevel.set", role.name));
                },
                description: null,
                emoji: null
            });
        });

        return options;
    }*/
}

export = WingsLevelCommand;