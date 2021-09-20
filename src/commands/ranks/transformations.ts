import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { asyncForEach, createMessageEmbed } from "../../utils/Utils";

class RanksCommand extends Command{
    public constructor(){
        super();
        this.availability=CommandAvailability.Guild;
        this.category=Rank;
        this.aliases=["ranks"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await Ranks.get(cmdArgs.guildId);
        if(!ranks) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));
        const data=[];
        ranks.sort((a, b)=>a.level-b.level);
        await asyncForEach(ranks, async(rank:RankLevel)=>{
            data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
        });
        const embed=new MessageEmbed();
        embed.setTitle(Localisation.getTranslation("transformations.title"));
        embed.setDescription(data.join("\n"));
        cmdArgs.message.reply({embeds: [await createMessageEmbed(embed, cmdArgs.guild)]});
    }
}

export=RanksCommand;