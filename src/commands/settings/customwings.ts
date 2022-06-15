import { MessageEmbed } from "discord.js";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { BotUser } from "../../BotClient";
import { CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { decodeCode, drawCardWithWings } from "../../utils/CardUtils";
import { getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getServerUserSettings } from "../../utils/RankUtils";
import { getImageReply, getMemberReply } from "../../utils/ReplyUtils";
import { canvasToMessageAttachment, downloadFile, getServerDatabase } from "../../utils/Utils";

class CustomWingsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.category = Settings;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
        const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, cmdArgs.guildId);

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
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
                        }
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

                            if (!existsSync(dir)) {
                                mkdirSync(dir, { recursive: true });
                            }

                            if (existsSync(userWings.wingsFile)) {
                                unlinkSync(userWings.wingsFile);
                            }

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

                            const { image: wingsImage, extension } = await drawCardWithWings(0, userLevel, serverUserSettings, image.url, image.url, undefined, undefined, user, cmdArgs.guild, filePath);

                            await createMessageButtons({
                                sendTarget: msg, author: cmdArgs.author, settings: { max: 1 }, options: { content: Localisation.getTranslation("generic.allcorrect"), files: [canvasToMessageAttachment(wingsImage, "testCard", extension)] }, buttons:
                                    [
                                        {
                                            customId: "accept",
                                            style: "PRIMARY",
                                            label: Localisation.getTranslation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                interaction.reply(Localisation.getTranslation("setrank.wings.download"));
                                                downloadFile(image.url, filePath, async () => {
                                                    userWings.wingsFile = filePath;
                                                    customWings[wingsIndex] = userWings;
                                                    await interaction.deleteReply();
                                                    await interaction.followUp(Localisation.getTranslation("customwings.wings.add", `<@${user.id}>`));
                                                });
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            label: Localisation.getTranslation("button.cancel"),
                                            style: "DANGER",
                                            onRun: async ({ interaction }) => {
                                                interaction.update({ content: Localisation.getTranslation("generic.canceled") });
                                            }
                                        }
                                    ]
                            });
                        }
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
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {
                            if (!customWings.length) {
                                return interaction.reply(Localisation.getTranslation("error.customwings.guild.none"));
                            }

                            const embed = new MessageEmbed();
                            embed.setDescription(customWings.map(w => `<@${w.userId}>`).join("\n"));
                            embed.setColor(await getBotRoleColor(cmdArgs.guild));

                            return interaction.reply({ embeds: [embed] });
                        }
                    }
                ]
            }
        });
    }
}

export = CustomWingsCommand;