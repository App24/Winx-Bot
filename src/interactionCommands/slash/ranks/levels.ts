import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { LevelsBaseCommand } from "../../../baseCommands/ranks/Levels";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { SlashCommand } from "../../../structs/SlashCommand";

class LevelsCommand extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Show your level!", type: ApplicationCommandType.ChatInput, options:
                [
                    {
                        name: "user",
                        description: "Mention user to see their levels",
                        type: ApplicationCommandOptionType.User
                    }
                ],
            dmPermission: false
        });

        this.available = CommandAvailable.Guild;

        this.baseCommand = new LevelsBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
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
            if (!tempUser) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.invalid.user"));
            user = tempUser;
        }
        if (user.bot) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.user.bot"));

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (leaderboardPosition < 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id);
        }
        leaderboardPosition += 1;

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.interaction.followUp(Localisation.getTranslation("error.invalid.member"));

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const { image, extension } = await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);

        cmdArgs.interaction.followUp({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
    }*/
}

export = LevelsCommand;