import { EmbedBuilder } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ErrorStruct } from "../../structs/databaseTypes/ErrorStruct";
import { dateToString } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { asyncForEach } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckErrorBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        const Errors = BotUser.getDatabase(DatabaseType.Errors);

        await createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, selectMenuOptions:
            {
                options: [
                    {
                        label: Localisation.getTranslation("button.check"),
                        value: "check",
                        onSelect: async ({ interaction }) => {
                            const { value: errorCode } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "checkerror.reply.code" });
                            if (errorCode === undefined)
                                return;
                            const error: ErrorStruct = await Errors.get(errorCode);
                            if (!error) return <any>interaction.followUp(Localisation.getTranslation("error.invalid.errorCode"));
                            interaction.followUp(Localisation.getTranslation("checkerror.error", dateToString(new Date(error.time), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}"), error.error));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {

                            const errors: { key: string, value: ErrorStruct }[] = await Errors.entries();
                            if (!errors || !errors.length) return interaction.reply(Localisation.getTranslation("error.empty.errors"));
                            const data = [];
                            errors.forEach(error => {
                                data.push(Localisation.getTranslation("checkerror.list", error.key, dateToString(new Date(error.value.time), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")));
                            });
                            const embed = new EmbedBuilder();
                            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                            embed.setDescription(data.join("\n"));
                            return interaction.reply({ embeds: [embed] });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.prune"),
                        value: "prune",
                        onSelect: async ({ interaction }) => {
                            const errors: { key: string, value: ErrorStruct }[] = await Errors.entries();
                            if (!errors || !errors.length) return interaction.reply(Localisation.getTranslation("error.empty.errors"));

                            const msPerMinute = 60 * 1000;
                            const msPerHour = msPerMinute * 60;
                            const msPerDay = msPerHour * 24;
                            const msPerWeek = msPerDay * 7;
                            const currentTime = new Date().getTime();
                            await asyncForEach(errors, async (error: { key: string, value: ErrorStruct }) => {
                                if (currentTime - error.value.time > msPerWeek * 2) {
                                    await Errors.delete(error.key);
                                }
                            });
                            return interaction.reply(Localisation.getTranslation("checkerror.prune"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.clear"),
                        value: "clear",
                        onSelect: async ({ interaction }) => {
                            await Errors.clear();
                            return interaction.reply(Localisation.getTranslation("checkerror.clear"));
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