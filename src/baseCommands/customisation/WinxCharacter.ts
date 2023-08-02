import { Localisation } from "../../localisation";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
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

    async updateWings(userSettings: Document<unknown, Record<string, unknown>, {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        wingsLevel: number;
        levelPing: boolean;
        winxCharacter: number;
        cardCode: string;
        cardSlots: Types.DocumentArray<{
            name?: string;
            code?: string;
            customWings?: string;
        }>;
        userId?: string;
    }> & {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } & {
        guildId: string;
        wingsLevel: number;
        levelPing: boolean;
        winxCharacter: number;
        cardCode: string;
        cardSlots: Types.DocumentArray<{
            name?: string;
            code?: string;
            customWings?: string;
        }>;
        userId?: string;
    }) {
        const options: SelectOption[] = [];

        const setWinxCharacter = async (character: WinxCharacter) => {
            userSettings.winxCharacter = character;
            await userSettings.save();
        };

        const isDefault = (character: string) => {
            return WinxCharacter[userSettings.winxCharacter] === character;
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