import { Guild, BaseGuildTextChannel, EmbedBuilder, TextChannel, ButtonStyle } from "discord.js";
import { existsSync, mkdirSync, unlinkSync, renameSync } from "fs";
import { BotUser } from "../../BotClient";
import { CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT, CUSTOM_WINGS_REQUEST_FOLDER, CUSTOM_WINGS_FOLDER } from "../../Constants";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomWings } from "../../structs/databaseTypes/CustomWings";
import { DEFAULT_SERVER_INFO, ServerData } from "../../structs/databaseTypes/ServerInfo";
import { WingsRequest } from "../../structs/databaseTypes/WingsRequest";
import { getTextChannelById, getBotRoleColor, getMemberById } from "../../utils/GetterUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getImageReply } from "../../utils/ReplyUtils";
import { getServerDatabase, downloadFile } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CustomWingsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        const WingsRequests = BotUser.getDatabase(DatabaseType.WingsRequests);
        const wingsRequests: WingsRequest[] = await getServerDatabase(WingsRequests, cmdArgs.guildId);

        if (!serverInfo.wingsRequestChannel) {
            return cmdArgs.reply("There is no set wings request channel, tell the mods to set one!");
        }

        cmdArgs.reply(`Recommended custom wings image size: ${CARD_CANVAS_WIDTH}px by ${CARD_CANVAS_HEIGHT}px to prevent any empty space or image being cut off`);

        const { value: image, message: msg } = await getImageReply({ sendTarget: cmdArgs.body, author: cmdArgs.author });
        if (!image) return;

        let wingsIndex = wingsRequests.findIndex(u => u.userId === cmdArgs.author.id);
        if (wingsIndex < 0) {
            wingsRequests.push(new WingsRequest(cmdArgs.author.id));
            wingsIndex = wingsRequests.length - 1;
        }
        const wingsRequest = wingsRequests[wingsIndex];

        const dir = `${CUSTOM_WINGS_REQUEST_FOLDER}/${cmdArgs.guildId}`;
        const filePath = `${dir}/${cmdArgs.author.id}.png`;

        const download = await msg.reply(Localisation.getTranslation("setrank.wings.download"));

        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        if (existsSync(wingsRequest.wingsFile)) {
            unlinkSync(wingsRequest.wingsFile);
        }

        await downloadFile(image.url, filePath);

        wingsRequest.wingsFile = filePath;
        wingsRequests[wingsIndex] = wingsRequest;
        await WingsRequests.set(cmdArgs.guildId, wingsRequests);
        await download.delete();
        await msg.reply(Localisation.getTranslation("generic.sent"));
        const channel = await getTextChannelById(serverInfo.wingsRequestChannel, cmdArgs.guild);
        await createWingsRequest(wingsRequest, cmdArgs.guild, channel);
    }
}

export async function createWingsRequest(wingsRequest: WingsRequest, guild: Guild, channel: BaseGuildTextChannel) {
    const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
    const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, channel.guildId);

    const WingsRequests = BotUser.getDatabase(DatabaseType.WingsRequests);
    const wingsRequests: WingsRequest[] = await getServerDatabase(WingsRequests, channel.guildId);

    const embed = new EmbedBuilder();

    embed.setColor(await getBotRoleColor(guild));

    const user = await getMemberById(wingsRequest.userId, channel.guild);

    const username = (user && (user.nickname || user.user.username)) || wingsRequest.userId;

    const title = `Requested Wings for ${username}`;

    embed.setTitle(title);
    embed.setImage(`attachment://${wingsRequest.userId}.png`);

    createMessageButtons({
        sendTarget: <TextChannel>channel, settings: { max: 1, time: -1 }, options: { embeds: [embed], files: [wingsRequest.wingsFile] }, buttons: [
            {
                customId: "accept",
                style: ButtonStyle.Success,
                label: Localisation.getTranslation("button.accept"),
                async onRun({ interaction }) {
                    let wingsIndex = customWings.findIndex(u => u.userId === user.id);
                    if (wingsIndex < 0) {
                        customWings.push(new CustomWings(user.id));
                        wingsIndex = customWings.length - 1;
                    }
                    const userWings = customWings[wingsIndex];

                    const dir = `${CUSTOM_WINGS_FOLDER}/${channel.guildId}`;
                    const filePath = `${dir}/${user.id}.png`;

                    if (!existsSync(dir)) {
                        mkdirSync(dir, { recursive: true });
                    }

                    if (existsSync(userWings.wingsFile)) {
                        unlinkSync(userWings.wingsFile);
                    }

                    const requestWingsIndex = wingsRequests.findIndex(u => u.userId === user.id);
                    if (requestWingsIndex < 0) {
                        return;
                    }

                    wingsRequests.splice(requestWingsIndex, 1);

                    const dmChannel = (await user.createDM());

                    if (dmChannel) {
                        const embed = new EmbedBuilder();

                        embed.setTitle("Your wings submission has been accepted!");

                        embed.setImage(`attachment://${wingsRequest.userId}.png`);

                        await dmChannel.send({ embeds: [embed], files: [wingsRequest.wingsFile] });
                    }

                    renameSync(wingsRequest.wingsFile, filePath);
                    userWings.wingsFile = filePath;
                    customWings[wingsIndex] = userWings;
                    await CustomWingsDatabase.set(channel.guildId, customWings);
                    await WingsRequests.set(channel.guildId, wingsRequests);
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
                    const requestWingsIndex = wingsRequests.findIndex(u => u.userId === user.id);
                    if (requestWingsIndex < 0) {
                        return;
                    }

                    const dmChannel = (await user.createDM());

                    if (dmChannel) {
                        const embed = new EmbedBuilder();

                        embed.setTitle("Your wings submission was rejected!");

                        embed.setImage(`attachment://${wingsRequest.userId}.png`);

                        await dmChannel.send({ embeds: [embed], files: [wingsRequest.wingsFile] });
                    }

                    if (existsSync(wingsRequest.wingsFile)) {
                        unlinkSync(wingsRequest.wingsFile);
                    }

                    wingsRequests.splice(requestWingsIndex, 1);

                    await WingsRequests.set(channel.guildId, wingsRequests);
                    // interaction.deferUpdate();
                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.setTitle(title + ` - Rejected by __${interaction.user.username}__`);
                    await interaction.update({ embeds: [embed], files: [] });
                },
            }
        ]
    });
}