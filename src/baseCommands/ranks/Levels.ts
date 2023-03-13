import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { drawCard, drawGreenScreenCard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
import { getServerDatabase, getLeaderboardMembers, canvasToMessageAttachment, isHexColor } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class LevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const tempUser = await getUserFromMention(cmdArgs.args[0]);
            if (!tempUser) return cmdArgs.reply("error.invalid.user");
            user = tempUser;
        }
        if (user.bot) return cmdArgs.reply("error.user.bot");

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        let msg: Message;
        if (cmdArgs instanceof CommandArguments) {
            msg = await cmdArgs.reply("magiclevels.generate");
        }

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (leaderboardPosition < 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id);
        }
        leaderboardPosition += 1;

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const { image, extension } = await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);

        try {
            cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
        } catch {
            serverUserSettings.animatedCard = false;
            cmdArgs.reply({ files: [canvasToMessageAttachment(await (await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild)).image, "magiclevels")] });
        }

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }

}

export class GreenScreenLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        let greenScreenColor = "#00ff00";

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            if (cmdArgs.args.length >= 2) {
                greenScreenColor = cmdArgs.args[1];
            }
            const tempUser = await getUserFromMention(cmdArgs.args[0]);
            if (!tempUser) {
                if (!isHexColor(cmdArgs.args[0])) return cmdArgs.reply("error.invalid.user");
                greenScreenColor = cmdArgs.args[0];
            }
            user = tempUser;
        }
        if (user.bot) return cmdArgs.reply("error.user.bot");

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        let msg: Message;
        if (cmdArgs instanceof CommandArguments) {
            msg = await cmdArgs.reply("magiclevels.generate");
        }

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (leaderboardPosition < 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id);
        }
        leaderboardPosition += 1;

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const image = await drawGreenScreenCard(greenScreenColor, leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);

        cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}