import { Message } from "discord.js";
import { CommandArguments } from "../../structs/Command";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { CardData, drawCard, drawGreenScreenCard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
import { canvasToMessageAttachment, isHexColor, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { getLeaderboardPosition, getWeeklyLeaderboardPosition } from "../../utils/XPUtils";
import { Localisation } from "../../localisation";

export class LevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
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
            let message = Localisation.getLocalisation("magiclevels.generate");
            if (option < options.length)
                message += `\n${options[option]}`;
            msg = await cmdArgs.localisedReply(message);
        }

        const leaderboardPosition = (await getLeaderboardPosition(member)) + 1;
        const weekleaderboardPosition = (await getWeeklyLeaderboardPosition(member)) + 1;

        const userLevel = await getOneDatabase(UserLevel, { guildId: cmdArgs.guildId, "levelData.userId": user.id }, () => new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: user.id } }));

        const currentRank = await getCurrentRank(userLevel.document.levelData.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.document.levelData.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const cardData: CardData = {
            leaderboardPosition,
            weeklyLeaderboardPosition: weekleaderboardPosition,
            currentRank,
            nextRank,
            serverUserSettings,
            userLevel: userLevel.document.levelData,
            member
        };

        const { image, extension } = await drawCard(cardData);

        setTimeout(async () => {
            cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });

            if (cmdArgs instanceof CommandArguments) {
                msg.delete();
            }
        }, 100);
    }

}

export class GreenScreenLevelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
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

        const userLevel = await getOneDatabase(UserLevel, { guildId: cmdArgs.guildId, "levelData.userId": user.id }, () => new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: user.id } }));

        const currentRank = await getCurrentRank(userLevel.document.levelData.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.document.levelData.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const cardData: CardData = {
            leaderboardPosition,
            weeklyLeaderboardPosition: weekleaderboardPosition,
            currentRank,
            nextRank,
            serverUserSettings,
            userLevel: userLevel.document.levelData,
            member
        };

        const image = await drawGreenScreenCard(greenScreenColor, cardData);

        cmdArgs.reply({ files: [canvasToMessageAttachment(image, "magiclevels")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}