import { ButtonStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class LevelPingBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        createMessageButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, buttons: [
                {
                    customId: "toggle",
                    emoji: userSettings.document.levelPing ? "❌" : "✅",
                    style: ButtonStyle.Primary,
                    onRun: async ({ interaction }) => {
                        userSettings.document.levelPing = !userSettings.document.levelPing;
                        userSettings.document.changedPing = true;
                        interaction.reply({ content: Localisation.getLocalisation("levelping.reply", userSettings.document.levelPing ? Localisation.getLocalisation("generic.enabled") : Localisation.getLocalisation("generic.disabled")) });
                        await userSettings.save();
                    }
                },
                {
                    customId: "cancel",
                    label: Localisation.getLocalisation("button.cancel"),
                    style: ButtonStyle.Danger,
                    onRun: async ({ interaction }) => {
                        await interaction.deferUpdate();
                    }
                }
            ]
        });
    }
}