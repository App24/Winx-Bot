import { ApplicationCommandType } from "discord.js";
import { CommandAvailable } from "../../../../structs/CommandAvailable";
import { SlashCommand } from "../../../../structs/SlashCommand";
import { WeeklyLeaderboardBaseCommand } from "../../../../baseCommands/ranks/RecentLeaderboard";

class WeeklyLeaderboardCommand extends SlashCommand {
    public constructor() {
        super({ type: ApplicationCommandType.User, name: "Weekly Leaderboard", dmPermission: false });

        this.deferEphemeral = true;

        this.available = CommandAvailable.Guild;

        this.baseCommand = new WeeklyLeaderboardBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
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
    }*/
}

export = WeeklyLeaderboardCommand;