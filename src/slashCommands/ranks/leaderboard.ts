import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { SlashCommand, SlashCommandArguments } from "../../structs/SlashCommand";
import { drawLeaderboard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getServerDatabase, getLeaderboardMembers, canvasToMessageAttachment } from "../../utils/Utils";

class LeaderboardCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Shows the leaderboard!", type: "CHAT_INPUT", options:
                [
                    {
                        name: "user",
                        description: "Mention user to see their position",
                        type: "USER",
                    }
                ]
        });

        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: SlashCommandArguments) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        if (!levels.length) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.empty.levels"));

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.invalid.user"));
            user = temp;
        }
        if (user.bot) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.user.bot"));
        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.invalid.member"));

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = levels.findIndex(u => u.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: levels[i], member, position: i });
            } else {
                return cmdArgs.interaction.followUp(Localisation.getTranslation("error.null.userLevel"));
            }
        }
        const leaderBoard = await drawLeaderboard(leaderboardLevels, user, cmdArgs.guildId);

        cmdArgs.interaction.followUp({ files: [canvasToMessageAttachment(leaderBoard, "leaderboard")] });
    }
}

export = LeaderboardCommand;