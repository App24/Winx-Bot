import { BotUser } from "../../BotClient";
import { getRoleById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandUsage, CommandAccess, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getServerDatabase } from "../../utils/Utils";
import { capitalise } from "../../utils/FormatUtils";

class TestLevelCommand extends Command{
    public constructor(){
        super();
        this.category=Moderator;
        this.minArgs=1;
        this.usage=[new CommandUsage(true, "argument.level")];
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const level=parseInt(cmdArgs.args[0]);
        if(isNaN(level)||level<0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        await cmdArgs.channel.send(Localisation.getTranslation("xp.level.up", cmdArgs.author, level));
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);
        const rankLevel=ranks.find(rank=>rank.level===level);
        if(rankLevel){
            const gifs=rankLevel.gifs;
            const rank=await getRoleById(rankLevel.roleId, cmdArgs.guild);
            await cmdArgs.channel.send(Localisation.getTranslation("xp.transformation.earn", cmdArgs.author, capitalise(rank.name)));
            if(gifs&&gifs.length){
                await cmdArgs.channel.send(gifs[Math.floor(Math.random()*gifs.length)]);
            }
        }
    }
}

export=TestLevelCommand;