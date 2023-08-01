import { ButtonStyle, EmbedBuilder } from "discord.js";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { BotUser } from "../../BotClient";
import { CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { CardData, decodeCode, drawCardWithWings } from "../../utils/CardUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getServerUserSettings } from "../../utils/RankUtils";
import { getMemberReply, getImageReply } from "../../utils/ReplyUtils";
import { getServerDatabase, canvasToMessageAttachment, downloadFile } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SetCustomWingsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
        const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, cmdArgs.guildId);

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            const { value: user } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            const wingsIndex = customWings.findIndex(u => u.userId === user.id);
                            if (wingsIndex < 0) {
                                return interaction.followUp(Localisation.getTranslation("error.customwings.user.none"));
                            }
                            const userWings = customWings[wingsIndex];

                            if (existsSync(userWings.wingsFile)) {
                                await interaction.followUp({ files: [userWings.wingsFile] });
                            } else {
                                return interaction.followUp(Localisation.getTranslation("error.customwings.user.none"));
                            }
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            const { value: user, message } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            let wingsIndex = customWings.findIndex(u => u.userId === user.id);
                            if (wingsIndex < 0) {
                                customWings.push(new CustomWings(user.id));
                                wingsIndex = customWings.length - 1;
                            }
                            const userWings = customWings[wingsIndex];

                            const { value: image, message: msg } = await getImageReply({ sendTarget: message, author: cmdArgs.author });
                            if (!image) return;

                            const dir = `${CUSTOM_WINGS_FOLDER}/${cmdArgs.guildId}`;
                            const filePath = `${dir}/${user.id}.png`;

                            const userLevel = new UserLevel(user.id);

                            const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);
                            serverUserSettings.animatedCard = false;

                            // const oldImage = userWings.wingsFile;

                            // userWings.wingsFile = filePath;
                            // customWings[wingsIndex] = userWings;
                            // await CustomWingsDatabase.set(cmdArgs.guildId, customWings);

                            const { cl_customWings } = decodeCode(serverUserSettings.cardCode);

                            if (!cl_customWings) {
                                serverUserSettings.cardCode += "|customWings_positionX=300|customWings_positionY=600|customWings_scaleX=1|customWings_scaleY=1|cl_customWings=1";
                            }

                            const cardData: CardData = {
                                leaderboardPosition: 0,
                                weeklyLeaderboardPosition: 0,
                                currentRank: null,
                                nextRank: null,
                                serverUserSettings,
                                userLevel,
                                member: user,
                                customWings: image.url
                            };

                            const { image: wingsImage, extension } = await drawCardWithWings(cardData);

                            await createMessageButtons({
                                sendTarget: msg, author: cmdArgs.author, settings: { max: 1 }, options: { content: Localisation.getTranslation("generic.allcorrect"), files: [canvasToMessageAttachment(wingsImage, "testCard", extension)] }, buttons:
                                    [
                                        {
                                            customId: "accept",
                                            style: ButtonStyle.Primary,
                                            label: Localisation.getTranslation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                interaction.reply(Localisation.getTranslation("setrank.wings.download"));

                                                if (!existsSync(dir)) {
                                                    mkdirSync(dir, { recursive: true });
                                                }

                                                if (existsSync(userWings.wingsFile)) {
                                                    unlinkSync(userWings.wingsFile);
                                                }

                                                await downloadFile(image.url, filePath);

                                                userWings.wingsFile = filePath;
                                                customWings[wingsIndex] = userWings;
                                                await CustomWingsDatabase.set(cmdArgs.guildId, customWings);
                                                await interaction.deleteReply();
                                                await interaction.followUp(Localisation.getTranslation("customwings.wings.add", `<@${user.id}>`));
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            label: Localisation.getTranslation("button.cancel"),
                                            style: ButtonStyle.Danger,
                                            onRun: async ({ interaction }) => {
                                                interaction.update({ content: Localisation.getTranslation("generic.canceled") });
                                            }
                                        }
                                    ]
                            });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "remove",
                        onSelect: async ({ interaction }) => {
                            const { value: user } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            const wingsIndex = customWings.findIndex(u => u.userId === user.id);
                            if (wingsIndex < 0) {
                                return interaction.followUp(Localisation.getTranslation("error.customwings.user.none"));
                            }
                            const userWings = customWings[wingsIndex];

                            if (existsSync(userWings.wingsFile)) {
                                unlinkSync(userWings.wingsFile);
                            }

                            customWings.splice(wingsIndex, 1);
                            await CustomWingsDatabase.set(cmdArgs.guildId, customWings);
                            await interaction.followUp(Localisation.getTranslation("customwings.wings.remove", `<@${user.id}>`));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {
                            if (!customWings.length) {
                                return interaction.reply(Localisation.getTranslation("error.customwings.guild.none"));
                            }

                            const embed = new EmbedBuilder();
                            embed.setDescription(customWings.map(w => `<@${w.userId}>`).join("\n"));
                            embed.setColor(await getBotRoleColor(cmdArgs.guild));

                            return interaction.reply({ embeds: [embed] });
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