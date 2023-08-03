import { Localisation } from "../../localisation";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { ModelWrapper } from "../../structs/ModelWrapper";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { capitalise } from "../../utils/FormatUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { Document, Types } from "mongoose";

export class WinxCharacterBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options: await this.updateWings(userSettings)
            }
        });
    }

    async updateWings(userSettings: ModelWrapper<typeof ServerUserSettings.schema>) {
        const options: SelectOption[] = [];

        const setWinxCharacter = async (character: WinxCharacter) => {
            userSettings.document.winxCharacter = character;
            await userSettings.save();
        };

        const isDefault = (character: string) => {
            return WinxCharacter[userSettings.document.winxCharacter] === character;
        };

        Object.keys(WinxCharacter).forEach((character) => {
            if (!isNaN(parseInt(character))) return;
            options.push({
                value: character,
                label: capitalise(character),
                default: isDefault(character),
                onSelect: async ({ interaction }) => {
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
    }
}