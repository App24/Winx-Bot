import { WinxCharacterBaseCommand } from "../../baseCommands/customisation/WinxCharacter";
import { Customisation } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class WinxCharacterCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["setcharacter", "setwinx"];

        this.baseCommand=new WinxCharacterBaseCommand();
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

        if (!userSettings.winxCharacter) userSettings.winxCharacter = WinxCharacter.None;
        if (!userSettings.winxCharacterB) userSettings.winxCharacterB = WinxCharacter.None;

        

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: "Winx Character for Primary Wings",
                            value: "wings_a",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("WINGS_A", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild)
                                    }
                                });
                            },
                            default: false,
                            description: null,
                            emoji: null
                        },
                        {
                            label: "Winx Character for Secondary Wings",
                            value: "wings_b",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("WINGS_B", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild)
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
                                        options: await this.updateWings("BOTH", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild)
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

    async updateWings(setType: "WINGS_A" | "WINGS_B" | "BOTH", ServerUserSettingsDatabase: Keyv, serverUserSettings: ServerUserSettings[], userSettings: ServerUserSettings, userIndex: number, guild: Guild) {
        const options: SelectOption[] = [];

        const setWinxCharacter = async (character: WinxCharacter) => {
            if (setType === "WINGS_A" || setType === "BOTH") {
                userSettings.winxCharacter = character;
            }
            if (setType === "WINGS_B" || setType === "BOTH") {
                userSettings.winxCharacterB = character;
            }
            serverUserSettings[userIndex] = userSettings;
            await ServerUserSettingsDatabase.set(guild.id, serverUserSettings);
        };

        const isDefault = (character: string) => {
            if (setType === "WINGS_A") {
                return WinxCharacter[userSettings.winxCharacter] === character;
            } else if (setType === "WINGS_B") {
                return WinxCharacter[userSettings.winxCharacterB] === character;
            }

            const wingsA = userSettings.winxCharacter;
            const wingsB = userSettings.winxCharacterB;

            if (WinxCharacter[wingsA] === character)
                return wingsA === wingsB;
            return false;
        };

        Object.keys(WinxCharacter).forEach((character)=>{
            if(!isNaN(parseInt(character))) return;
            options.push({
                value: character,
                label: capitalise(character),
                default: isDefault(character),
                onSelect: async({interaction})=>{
                    setWinxCharacter(WinxCharacter[character]);
                    await interaction.reply(Localisation.getTranslation("winxcharacter.set", character));
                },
                description: null,
                emoji: null
            });
        });

        options.push({
            value: "cancel",
            label: Localisation.getTranslation("generic.cancel"),
            onSelect: async ({ interaction }) => {
                interaction.deferUpdate();
            },
            default: false,
            description: null,
            emoji: null
        });

        return options;
    }*/
}

export = WinxCharacterCommand;