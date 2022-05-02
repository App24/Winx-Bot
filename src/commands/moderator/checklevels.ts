import { Message, BaseGuildTextChannel, GuildBasedChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { PREFIX } from "../../Constants";
import { getMemberFromMention, getTextChannelFromMention } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach, getAllMessages } from "../../utils/Utils";
import { addXP, XPInfo } from "../../utils/XPUtils";
import { secondsToTime } from "../../utils/FormatUtils";

class CheckLevelsCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;
        this.usage = [new CommandUsage(true, "argument.user")];
        this.category = Moderator;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));
        if (member.user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
        const channels = Array.from(cmdArgs.guild.channels.cache.values());

        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        const excluded = serverInfo.excludeChannels;

        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        if (!levels || !levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        const user = levels.find(u => u.userId === member.id);
        user.level = 0;
        user.xp = 0;
        await Levels.set(cmdArgs.guildId, levels);

        await cmdArgs.message.reply(Localisation.getTranslation("checklevels.start"));
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
                if (msg.deleted) return;
                if (msg.content.toLowerCase().startsWith(PREFIX)) return;
                if (msg.author.id === member.id) {
                    if (msg.content.length < serverInfo.minMessageLength) return;
                    const xp = Math.ceil((Math.min(msg.content.length, serverInfo.maxMessageLength) / serverInfo.maxMessageLength) * serverInfo.maxXpPerMessage);
                    totalXp += xp;
                }
            });
            await addXP(new XPInfo(totalXp, member, cmdArgs.guild, <BaseGuildTextChannel>cmdArgs.channel), false);
            const timeDifferent = new Date().getTime() - startTime;
            await cmdArgs.channel.send(Localisation.getTranslation("checklevels.end.channel", channel, index + 1, NTChannels.length, secondsToTime(timeDifferent / 1000)));
        });
        cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    }
}

export = CheckLevelsCommand;