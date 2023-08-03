import { GuildBasedChannel, BaseGuildTextChannel, Message } from "discord.js";
import { PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { secondsToTime } from "../../utils/FormatUtils";
import { getMemberFromMention, getTextChannelById, getTextChannelFromMention } from "../../utils/GetterUtils";
import { getLeaderboardMembers, asyncForEach, getAllMessages, getOneDatabase, getDatabase } from "../../utils/Utils";
import { addXP } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ServerData } from "../../structs/databaseTypes/ServerData";

export class CheckLbLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const channels = Array.from(cmdArgs.guild.channels.cache.values());

        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));
        const excluded = serverInfo.document.excludeChannels;

        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });

        if (!levels.length) return cmdArgs.reply("error.empty.levels");

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, levels.map(l => l.document.levelData));

        await asyncForEach(leaderboardLevels, async (topLevel) => {
            topLevel.userLevel.level = 0;
            topLevel.userLevel.xp = 0;
        });
        leaderboardLevels.forEach(level => {
            const index = levels.findIndex(u => u.document.levelData.userId === level.userLevel.userId);
            levels[index].document.levelData = level.userLevel;
        });
        await asyncForEach(levels, async (level) => {
            await level.save();
        });

        await cmdArgs.reply("checklevels.start");
        const NTChannels = [];
        await asyncForEach(channels, async (channel: GuildBasedChannel) => {
            if ((<any>channel).messages) {
                if (excluded) {
                    if (excluded.find(c => c === channel.id)) return;
                }
                const NTChannel = await getTextChannelById(channel.id, cmdArgs.guild);
                NTChannels.push(NTChannel);
            }
        });
        await asyncForEach(NTChannels, async (channel: BaseGuildTextChannel, index: number) => {
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.start.channel", channel, index + 1, NTChannels.length));
            const startTime = new Date().getTime();
            const messages = await getAllMessages(channel);
            await asyncForEach(leaderboardLevels, async (topLevel) => {
                let totalXp = 0;
                await asyncForEach(messages, async (msg: Message) => {
                    if (msg.content.toLowerCase().startsWith(PREFIX)) return;
                    if (msg.author.id === topLevel.member.id) {
                        if (msg.content.length < serverInfo.document.minMessageLength) return;
                        const xp = Math.ceil((Math.min(msg.content.length, serverInfo.document.maxMessageLength) / serverInfo.document.maxMessageLength) * serverInfo.document.maxXpPerMessage);
                        totalXp += xp;
                    }
                });
                await addXP({ xp: totalXp, member: topLevel.member, guild: cmdArgs.guild, channel: <BaseGuildTextChannel>cmdArgs.channel }, false, true);
            });
            const timeDifferent = new Date().getTime() - startTime;
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index + 1, NTChannels.length, secondsToTime(timeDifferent / 1000)));
        });
        cmdArgs.reply("generic.done");
    }
}

export class CheckLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");
        if (member.user.bot) return cmdArgs.reply("error.user.bot");
        const channels = Array.from(cmdArgs.guild.channels.cache.values());

        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));
        const excluded = serverInfo.document.excludeChannels;

        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });

        if (!levels.length) return cmdArgs.reply("error.empty.levels");

        const user = levels.find(u => u.document.levelData.userId === member.id);
        user.document.levelData.level = 0;
        user.document.levelData.xp = 0;
        await user.save();

        await cmdArgs.reply("checklevels.start");
        const NTChannels = [];
        await asyncForEach(channels, async (channel: GuildBasedChannel) => {
            if ((<any>channel).messages) {
                if (excluded) {
                    if (excluded.find(c => c === channel.id)) return;
                }
                const NTChannel = await getTextChannelFromMention(channel.id, cmdArgs.guild);
                NTChannels.push(NTChannel);
            }
        });
        await asyncForEach(NTChannels, async (channel: BaseGuildTextChannel, index: number) => {
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.start.channel", channel, index + 1, NTChannels.length));
            const startTime = new Date().getTime();
            const messages = await getAllMessages(channel);
            let totalXp = 0;
            await asyncForEach(messages, async (msg: Message) => {
                if (msg.content.toLowerCase().startsWith(PREFIX)) return;
                if (msg.author.id === member.id) {
                    if (msg.content.length < serverInfo.document.minMessageLength) return;
                    const xp = Math.ceil((Math.min(msg.content.length, serverInfo.document.maxMessageLength) / serverInfo.document.maxMessageLength) * serverInfo.document.maxXpPerMessage);
                    totalXp += xp;
                }
            });
            await addXP({ xp: totalXp, member, guild: cmdArgs.guild, channel: <BaseGuildTextChannel>cmdArgs.channel }, false, true);
            const timeDifferent = new Date().getTime() - startTime;
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index + 1, NTChannels.length, secondsToTime(timeDifferent / 1000)));
        });
        cmdArgs.reply("generic.done");
    }
}