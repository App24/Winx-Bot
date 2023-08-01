import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { CardData, drawCard, drawGreenScreenCard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
import { getServerDatabase, getLeaderboardMembers, canvasToMessageAttachment, isHexColor } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { RecentLeaderboardData } from "../../structs/databaseTypes/RecentLeaderboard";
import { getLeaderboardPosition, getWeeklyLeaderboardPosition } from "../../utils/XPUtils";
import { Localisation } from "../../localisation";

export class LevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

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
            const options = ["You can be pinged when you level by using w!levelping", "You can boost to get custom wings"];
            const option = Math.floor((options.length * 3) * Math.random());
            let message = Localisation.getTranslation("magiclevels.generate");
            if (option < options.length)
                message += `\n${options[option]}`;
            msg = await cmdArgs.localisedReply(message);
        }

        const leaderboardPosition = (await getLeaderboardPosition(member)) + 1;
        const weekleaderboardPosition = (await getWeeklyLeaderboardPosition(member)) + 1;

        /*const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, levels);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (leaderboardPosition < 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id);
        }
        leaderboardPosition += 1;

        const weekleaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, recentLeaderboard.users);
        let weekleaderboardPosition = weekleaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (weekleaderboardPosition < 0) {
            weekleaderboardPosition = recentLeaderboard.users.findIndex(u => u.userId === user.id);
        }
        weekleaderboardPosition += 1;*/

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const cardData: CardData = {
            leaderboardPosition,
            weeklyLeaderboardPosition: weekleaderboardPosition,
            currentRank,
            nextRank,
            serverUserSettings,
            userLevel,
            member
        };

        const { image, extension } = await drawCard(cardData);

        setTimeout(async () => {
            try {
                cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
            } catch {
                await cmdArgs.localisedReply("Failed to create animated card");
                serverUserSettings.animatedCard = false;
                cmdArgs.reply({ files: [canvasToMessageAttachment(await (await drawCard(cardData)).image, "magiclevels")] });
            }

            if (cmdArgs instanceof CommandArguments) {
                msg.delete();
            }
        }, 100);
    }

}

export class GreenScreenLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        let greenScreenColor = "#00ff00";

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

        const leaderboardPosition = (await getLeaderboardPosition(member)) + 1;
        const weekleaderboardPosition = (await getWeeklyLeaderboardPosition(member)) + 1;

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const cardData: CardData = {
            leaderboardPosition,
            weeklyLeaderboardPosition: weekleaderboardPosition,
            currentRank,
            nextRank,
            serverUserSettings,
            userLevel,
            member
        };

        const image = await drawGreenScreenCard(greenScreenColor, cardData);

        cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}