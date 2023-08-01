import { GuildMember, GuildBasedChannel, BaseGuildTextChannel, Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerData } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { secondsToTime } from "../../utils/FormatUtils";
import { getMemberFromMention, getTextChannelById, getTextChannelFromMention } from "../../utils/GetterUtils";
import { getServerDatabase, getLeaderboardMembers, asyncForEach, getAllMessages } from "../../utils/Utils";
import { addXP } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckLbLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const channels = Array.from(cmdArgs.guild.channels.cache.values());

        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        const excluded = serverInfo.excludeChannels;

        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        if (!levels.length) return cmdArgs.reply("error.empty.levels");

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, levels);

        await asyncForEach(leaderboardLevels, async (topLevel: { userLevel: UserLevel, member: GuildMember }) => {
            topLevel.userLevel.level = 0;
            topLevel.userLevel.xp = 0;
        });
        leaderboardLevels.forEach(level => {
            const index = levels.findIndex(u => u.userId === level.userLevel.userId);
            levels[index] = level.userLevel;
        });
        await Levels.set(cmdArgs.guildId, levels);

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
            await asyncForEach(leaderboardLevels, async (topLevel: { userLevel: UserLevel, member: GuildMember }) => {
                let totalXp = 0;
                await asyncForEach(messages, async (msg: Message) => {
                    if (msg.content.toLowerCase().startsWith(PREFIX)) return;
                    if (msg.author.id === topLevel.member.id) {
                        if (msg.content.length < serverInfo.minMessageLength) return;
                        const xp = Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength) / serverInfo.maxMessageLength) * serverInfo.maxXpPerMessage);
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

        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerData = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        const excluded = serverInfo.excludeChannels;

        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        if (!levels.length) return cmdArgs.reply("error.empty.levels");

        const user = levels.find(u => u.userId === member.id);
        user.level = 0;
        user.xp = 0;
        await Levels.set(cmdArgs.guildId, levels);

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
                    if (msg.content.length < serverInfo.minMessageLength) return;
                    const xp = Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength) / serverInfo.maxMessageLength) * serverInfo.maxXpPerMessage);
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