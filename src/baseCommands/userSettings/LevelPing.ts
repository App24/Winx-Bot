import { ButtonStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class LevelPingBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        createMessageButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, buttons: [
                {
                    customId: "toggle",
                    emoji: userSettings.levelPing ? "❌" : "✅",
                    style: ButtonStyle.Primary,
                    onRun: async ({ interaction }) => {
                        userSettings.levelPing = !userSettings.levelPing;
                        interaction.reply({ content: Localisation.getTranslation("levelping.reply", userSettings.levelPing ? Localisation.getTranslation("generic.enabled") : Localisation.getTranslation("generic.disabled")) });
                        await userSettings.save();
                    }
                },
                {
                    customId: "cancel",
                    label: Localisation.getTranslation("button.cancel"),
                    style: ButtonStyle.Danger,
                    onRun: async ({ interaction }) => {
                        await interaction.deferUpdate();
                    }
                }
            ]
        });
    }
}