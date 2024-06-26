import { Message } from "discord.js";
import { CommandArguments } from "../../structs/Command";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { drawLeaderboard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getLeaderboardMembers, canvasToMessageAttachment, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { DocumentWrapper } from "../../structs/ModelWrapper";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class LeaderboardBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });
        if (!levels.length) return cmdArgs.reply("error.empty.levels");

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.reply("error.invalid.user");
            user = temp;
        }
        if (user.bot) return cmdArgs.reply("error.user.bot");
        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        let msg: Message;
        if (cmdArgs instanceof CommandArguments) {
            msg = await cmdArgs.reply("leaderboard.generate");
        }

        {
            const i = levels.findIndex(u => u.document.levelData.userId === user.id);
            if (i < 0) {
                const userLevel = new DocumentWrapper(new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: user.id } }));
                await userLevel.save();
                levels.push(userLevel);
            }
        }

        levels.sort((a, b) => {
            if (a.document.levelData.level === b.document.levelData.level) {
                return b.document.levelData.xp - a.document.levelData.xp;
            }
            return b.document.levelData.level - a.document.levelData.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, levels.map(l => l.document.levelData));

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = levels.findIndex(u => u.document.levelData.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: levels[i].document.levelData, member, position: i });
            } else {
                return cmdArgs.reply("error.null.userLevel");
            }
        }

        const leaderBoard = await drawLeaderboard(leaderboardLevels, user, cmdArgs.guildId, "Leaderboard");

        cmdArgs.reply({ files: [canvasToMessageAttachment(leaderBoard, "leaderboard")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}