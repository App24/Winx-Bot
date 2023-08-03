import { TextInputStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { ServerUserSettings, DEFAULT_CARD_CODE } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createInteractionModal } from "../../utils/InteractionModalUtils";

export class CardCodeBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const userSettings = await getOneDatabase(ServerUserSettings, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new ServerUserSettings({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            await interaction.reply({ content: userSettings.document.cardCode || DEFAULT_CARD_CODE, ephemeral: true });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            await createInteractionModal({
                                fields: { custom_id: "code", label: "Card Code", max_length: 4000, style: TextInputStyle.Short, required: true },
                                sendTarget: interaction,
                                title: "Set Card Code",
                                onSubmit: async ({ data, interaction }) => {

                                    interaction.reply({ content: Localisation.getTranslation("cardcode.set.output") });

                                    const code = data.information.code;

                                    if (code === undefined) return;
                                    userSettings.document.cardCode = code;
                                    await userSettings.save();
                                }
                            });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.reset"),
                        value: "reset",
                        onSelect: async ({ interaction }) => {
                            userSettings.document.cardCode = DEFAULT_CARD_CODE;
                            await userSettings.save();
                            interaction.reply(Localisation.getTranslation("cardcode.reset.output"));
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