import { EmbedBuilder } from "discord.js";
import { Localisation } from "../../localisation";
import { dateToString } from "../../utils/FormatUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { asyncForEach, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ErrorData } from "../../structs/databaseTypes/ErrorData";
import { CommandAccess } from "../../structs/CommandAccess";

export class CheckErrorBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        await createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, selectMenuOptions:
            {
                options: [
                    {
                        label: Localisation.getLocalisation("button.check"),
                        value: "check",
                        onSelect: async ({ interaction }) => {
                            const { value: errorCode } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "checkerror.reply.code" });
                            if (errorCode === undefined)
                                return;
                            const error = await getOneDatabase(ErrorData, { errorId: errorCode });
                            if (error.isNull()) return <any>interaction.followUp(Localisation.getLocalisation("error.invalid.errorCode"));
                            interaction.followUp(Localisation.getLocalisation("checkerror.error", dateToString(error.document.createdAt, "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}"), error.document.error));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {

                            const errors = await ErrorData.find();
                            if (!errors || !errors.length) return interaction.reply(Localisation.getLocalisation("error.empty.errors"));
                            const data = [];
                            errors.forEach(error => {
                                data.push(Localisation.getLocalisation("checkerror.list", error.errorId, dateToString(error.createdAt, "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")));
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
                        label: Localisation.getLocalisation("button.prune"),
                        value: "prune",
                        onSelect: async ({ interaction }) => {
                            const errors = await ErrorData.find();
                            if (!errors || !errors.length) return interaction.reply(Localisation.getLocalisation("error.empty.errors"));

                            const msPerMinute = 60 * 1000;
                            const msPerHour = msPerMinute * 60;
                            const msPerDay = msPerHour * 24;
                            const msPerWeek = msPerDay * 7;
                            const currentTime = new Date().getTime();
                            await asyncForEach(errors, async (error) => {
                                if (currentTime - error.createdAt.getTime() > msPerWeek * 2) {
                                    await ErrorData.deleteOne({ errorId: error.errorId });
                                }
                            });
                            return interaction.reply(Localisation.getLocalisation("checkerror.prune"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.clear"),
                        value: "clear",
                        onSelect: async ({ interaction }) => {
                            await ErrorData.deleteMany();
                            return interaction.reply(Localisation.getLocalisation("checkerror.clear"));
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