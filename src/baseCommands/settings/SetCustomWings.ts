import { ButtonStyle, EmbedBuilder } from "discord.js";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { CardData, decodeCode, drawCardWithWings } from "../../utils/CardUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getServerUserSettings } from "../../utils/RankUtils";
import { getMemberReply, getImageReply } from "../../utils/ReplyUtils";
import { canvasToMessageAttachment, downloadFile, getOneDatabase, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ModelWrapper } from "../../structs/ModelWrapper";

export class SetCustomWingsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getLocalisation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            const { value: user } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            const userWings = await getOneDatabase(CustomWings, { guildId: cmdArgs.guildId, userId: user.id });
                            if (!userWings) {
                                return interaction.followUp(Localisation.getLocalisation("error.customwings.user.none"));
                            }

                            if (existsSync(userWings.document.wingsFile)) {
                                await interaction.followUp({ files: [userWings.document.wingsFile] });
                            } else {
                                return interaction.followUp(Localisation.getLocalisation("error.customwings.user.none"));
                            }
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            const { value: user, message } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            const userWings = await getOneDatabase(CustomWings, { guildId: cmdArgs.guildId, userId: user.id }, () => new CustomWings({ guildId: cmdArgs.guildId, userId: user.id }));

                            const { value: image, message: msg } = await getImageReply({ sendTarget: message, author: cmdArgs.author });
                            if (!image) return;

                            const dir = `${CUSTOM_WINGS_FOLDER}/${cmdArgs.guildId}`;
                            const filePath = `${dir}/${user.id}.png`;

                            const userLevel = new UserLevel({guildId: cmdArgs.guildId, userId: user.id});

                            const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

                            // const oldImage = userWings.wingsFile;

                            // userWings.wingsFile = filePath;
                            // customWings[wingsIndex] = userWings;
                            // await CustomWingsDatabase.set(cmdArgs.guildId, customWings);

                            const { cl_customWings } = decodeCode(serverUserSettings.document.cardCode);

                            if (!cl_customWings) {
                                serverUserSettings.document.cardCode += "|customWings_positionX=300|customWings_positionY=600|customWings_scaleX=1|customWings_scaleY=1|cl_customWings=1";
                            }

                            const cardData: CardData = {
                                leaderboardPosition: 0,
                                weeklyLeaderboardPosition: 0,
                                currentRank: new ModelWrapper(null),
                                nextRank: new ModelWrapper(null),
                                serverUserSettings,
                                userLevel: userLevel.levelData,
                                member: user,
                                customWings: image.url
                            };

                            const { image: wingsImage, extension } = await drawCardWithWings(cardData);

                            await createMessageButtons({
                                sendTarget: msg, author: cmdArgs.author, settings: { max: 1 }, options: { content: Localisation.getLocalisation("generic.allcorrect"), files: [canvasToMessageAttachment(wingsImage, "testCard", extension)] }, buttons:
                                    [
                                        {
                                            customId: "accept",
                                            style: ButtonStyle.Primary,
                                            label: Localisation.getLocalisation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                interaction.reply(Localisation.getLocalisation("setrank.wings.download"));

                                                if (!existsSync(dir)) {
                                                    mkdirSync(dir, { recursive: true });
                                                }

                                                if (existsSync(userWings.document.wingsFile)) {
                                                    unlinkSync(userWings.document.wingsFile);
                                                }

                                                await downloadFile(image.url, filePath);

                                                userWings.document.wingsFile = filePath;
                                                await userWings.save();
                                                await interaction.deleteReply();
                                                await interaction.followUp(Localisation.getLocalisation("customwings.wings.add", `<@${user.id}>`));
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            label: Localisation.getLocalisation("button.cancel"),
                                            style: ButtonStyle.Danger,
                                            onRun: async ({ interaction }) => {
                                                interaction.update({ content: Localisation.getLocalisation("generic.canceled") });
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
                        label: Localisation.getLocalisation("button.remove"),
                        value: "remove",
                        onSelect: async ({ interaction }) => {
                            const { value: user } = await getMemberReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!user) return;

                            const userWings = await getOneDatabase(CustomWings, { guildId: cmdArgs.guildId, userId: user.id });
                            if (!userWings) {
                                return interaction.followUp(Localisation.getLocalisation("error.customwings.user.none"));
                            }

                            if (existsSync(userWings.document.wingsFile)) {
                                unlinkSync(userWings.document.wingsFile);
                            }

                            await CustomWings.deleteOne({ guildId: cmdArgs.guildId, userId: user.id });

                            await interaction.followUp(Localisation.getLocalisation("customwings.wings.remove", `<@${user.id}>`));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getLocalisation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {
                            const customWings = await getDatabase(CustomWings, { guildId: cmdArgs.guildId });

                            if (!customWings.length) {
                                return interaction.reply(Localisation.getLocalisation("error.customwings.guild.none"));
                            }

                            const embed = new EmbedBuilder();
                            embed.setDescription(customWings.map(wing => `<@${wing.document.userId}>`).join("\n"));
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