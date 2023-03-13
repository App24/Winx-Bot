import { DMChannel, MessageComponentInteraction } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings, DEFAULT_CARD_CODE } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CardCodeBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            await interaction.reply({ content: userSettings.cardCode || DEFAULT_CARD_CODE, ephemeral: true });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            let sendTarget: DMChannel | MessageComponentInteraction = await cmdArgs.author.createDM();
                            if (!sendTarget) {
                                sendTarget = interaction;
                            } else {
                                await interaction.reply("Please check your DM");
                                // await interaction.deferUpdate();
                            }
                            const { value: code, message } = await getStringReply({ sendTarget, author: cmdArgs.author, options: "argument.reply.cardcode" });
                            if (code === undefined) return;
                            userSettings.cardCode = code;
                            serverUserSettings[userIndex] = userSettings;
                            message.reply(Localisation.getTranslation("cardcode.set.output", code));
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.reset"),
                        value: "reset",
                        onSelect: async ({ interaction }) => {
                            userSettings.cardCode = DEFAULT_CARD_CODE;
                            serverUserSettings[userIndex] = userSettings;
                            interaction.reply(Localisation.getTranslation("cardcode.reset.output"));
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                        },
                        default: false,
                        description: null,
                        emoji: null
                    }
                ]
            }
        });
    }
}