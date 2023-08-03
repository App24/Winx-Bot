import { Guild, BaseGuildTextChannel, EmbedBuilder, TextChannel, ButtonStyle } from "discord.js";
import { existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import { CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT, CUSTOM_WINGS_REQUEST_FOLDER, CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { WingsRequest, WingsRequestData } from "../../structs/databaseTypes/WingsRequest";
import { getTextChannelById, getBotRoleColor, getMemberById } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getImageReply } from "../../utils/ReplyUtils";
import { downloadFile, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ServerData } from "../../structs/databaseTypes/ServerData";
import { ModelWrapper } from "../../structs/ModelWrapper";

export class CustomWingsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        if (!serverInfo.document.wingsRequestChannel) {
            return cmdArgs.reply("There is no set wings request channel, tell the mods to set one!");
        }

        cmdArgs.reply(`Recommended custom wings image size: ${CARD_CANVAS_WIDTH}px by ${CARD_CANVAS_HEIGHT}px to prevent any empty space or image being cut off`);

        const { value: image, message: msg } = await getImageReply({ sendTarget: cmdArgs.body, author: cmdArgs.author });
        if (!image) return;

        const wingsRequest = await getOneDatabase(WingsRequest, { guildId: cmdArgs.guildId, userId: cmdArgs.author.id }, () => new WingsRequest({ guildId: cmdArgs.guildId, userId: cmdArgs.author.id }));

        const dir = `${CUSTOM_WINGS_REQUEST_FOLDER} /${cmdArgs.guildId}`;
        const filePath = `${dir}/${cmdArgs.author.id}.png`;

        const download = await msg.reply(Localisation.getTranslation("setrank.wings.download"));

        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        if (existsSync(wingsRequest.document.wingsFile)) {
            unlinkSync(wingsRequest.document.wingsFile);
        }

        await downloadFile(image.url, filePath);

        wingsRequest.document.wingsFile = filePath;

        await wingsRequest.save();
        await download.delete();
        await msg.reply(Localisation.getTranslation("generic.sent"));
        const channel = await getTextChannelById(serverInfo.document.wingsRequestChannel, cmdArgs.guild);
        await createWingsRequest(wingsRequest, cmdArgs.guild, channel);
    }
}

export async function createWingsRequest(wingsRequest: ModelWrapper<typeof WingsRequest.schema>, guild: Guild, channel: BaseGuildTextChannel) {
    const embed = new EmbedBuilder();

    embed.setColor(await getBotRoleColor(guild));

    const user = await getMemberById(wingsRequest.document.userId, channel.guild);

    const username = (user && (user.nickname || user.user.username)) || wingsRequest.document.userId;

    const title = `Requested Wings for ${username}`;

    embed.setTitle(title);
    embed.setImage(`attachment://${wingsRequest.document.userId}.png`);

    createMessageButtons({
        sendTarget: <TextChannel>channel, settings: { max: 1, time: -1 }, options: { embeds: [embed], files: [wingsRequest.document.wingsFile] }, buttons: [
            {
                customId: "accept",
                style: ButtonStyle.Success,
                label: Localisation.getTranslation("button.accept"),
                async onRun({ interaction }) {
                    const userWings = await getOneDatabase(CustomWings, { guildId: guild.id, userId: user.id }, () => new CustomWings({ guildId: guild.id, userId: user.id }));

                    const dir = `${CUSTOM_WINGS_FOLDER}/${channel.guildId}`;
                    const filePath = `${dir}/${user.id}.png`;

                    if (!existsSync(dir)) {
                        mkdirSync(dir, { recursive: true });
                    }

                    if (existsSync(userWings.document.wingsFile)) {
                        unlinkSync(userWings.document.wingsFile);
                    }

                    const requestWingsIndex = await getOneDatabase(WingsRequest, { guildId: wingsRequest.document.guildId, userId: wingsRequest.document.userId });
                    if (!requestWingsIndex) {
                        return;
                    }

                    const dmChannel = (await user.createDM());

                    if (dmChannel) {
                        const embed = new EmbedBuilder();

                        embed.setTitle("Your wings submission has been accepted!");

                        embed.setImage(`attachment://${wingsRequest.document.userId}.png`);

                        await dmChannel.send({ embeds: [embed], files: [wingsRequest.document.wingsFile] });
                    }

                    renameSync(wingsRequest.document.wingsFile, filePath);
                    userWings.document.wingsFile = filePath;
                    await userWings.save();

                    await WingsRequest.deleteOne({ guildId: wingsRequest.document.guildId, userId: wingsRequest.document.userId });
                    // interaction.deferUpdate();
                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.setTitle(title + ` - Accepted by __${interaction.user.username}__`);
                    await interaction.update({ embeds: [embed], files: [] });
                },
            },
            {
                customId: "deny",
                style: ButtonStyle.Danger,
                label: Localisation.getTranslation("button.deny"),
                async onRun({ interaction }) {
                    const requestWingsIndex = await getOneDatabase(WingsRequest, { guildId: wingsRequest.document.guildId, userId: wingsRequest.document.userId });
                    if (!requestWingsIndex) {
                        return;
                    }

                    const dmChannel = (await user.createDM());

                    if (dmChannel) {
                        const embed = new EmbedBuilder();

                        embed.setTitle("Your wings submission was rejected!");

                        embed.setImage(`attachment://${wingsRequest.document.userId}.png`);

                        await dmChannel.send({ embeds: [embed], files: [wingsRequest.document.wingsFile] });
                    }

                    if (existsSync(wingsRequest.document.wingsFile)) {
                        unlinkSync(wingsRequest.document.wingsFile);
                    }

                    await WingsRequest.deleteOne({ guildId: wingsRequest.document.guildId, userId: wingsRequest.document.userId });
                    // interaction.deferUpdate();
                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.setTitle(title + ` - Rejected by __${interaction.user.username}__`);
                    await interaction.update({ embeds: [embed], files: [] });
                },
            }
        ]
    });
}