import { GuildMember, Message, BaseGuildTextChannel, GuildBasedChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { getTextChannelById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, getLeaderboardMembers, asyncForEach, getAllMessages } from "../../utils/Utils";
import { addXP } from "../../utils/XPUtils";
import { secondsToTime } from "../../utils/FormatUtils";

class CheckLBLevelsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
        this.category = Moderator;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const channels = Array.from(cmdArgs.guild.channels.cache.values());

        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        const excluded = serverInfo.excludeChannels;

        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        if (!levels || !levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);

        await asyncForEach(leaderboardLevels, async (topLevel: { userLevel: UserLevel, member: GuildMember }) => {
            topLevel.userLevel.level = 0;
            topLevel.userLevel.xp = 0;
        });
        leaderboardLevels.forEach(level => {
            const index = levels.findIndex(u => u.userId === level.userLevel.userId);
            levels[index] = level.userLevel;
        });
        await Levels.set(cmdArgs.guildId, levels);

        await cmdArgs.message.reply(Localisation.getTranslation("checklevels.start"));
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
                    if (msg.deleted) return;
                    if (msg.content.toLowerCase().startsWith(PREFIX)) return;
                    if (msg.author.id === topLevel.member.id) {
                        if (msg.content.length < serverInfo.minMessageLength) return;
                        const xp = Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength) / serverInfo.maxMessageLength) * serverInfo.maxXpPerMessage);
                        totalXp += xp;
                    }
                });
                await addXP({ xp: totalXp, member: topLevel.member, guild: cmdArgs.guild, channel: <BaseGuildTextChannel>cmdArgs.channel }, false);
            });
            const timeDifferent = new Date().getTime() - startTime;
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index + 1, NTChannels.length, secondsToTime(timeDifferent / 1000)));
        });
        cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    }
}

export = CheckLBLevelsCommand;
