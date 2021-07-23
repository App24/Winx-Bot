import { GuildMember, Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getMemberByID, getUserFromMention } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach, getLevelXP, getBotRoleColor, getLeaderboardMembers } from "../../Utils";

class RankCommand extends Command{
    public constructor(){
        super();
        this.category=Rank;
        this.usage=[new CommandUsage(false, "argument.user")];
        this.maxArgs=1;
        this.aliases=["rank", "lb"];
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, cmdArgs.guild.id);
        if(!levels) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));
        let _user=cmdArgs.message.author;
        if(cmdArgs.args.length){
            const temp=await getUserFromMention(cmdArgs.args[0]);
            if(!temp) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            _user=temp;
        }
        if(_user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
        const member=await getMemberByID(_user.id, cmdArgs.guild);
        if(!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        //Sorts levels list
        levels.sort((a,b)=>{
            if(a.level===b.level){
                return b.xp-a.xp;
            }
            return b.level-a.level;
        });

        const leaderboardLevels=await getLeaderboardMembers(cmdArgs.guild);

        const data=[];
        let i=1;
        await asyncForEach(leaderboardLevels, async(element:{userLevel: UserLevel, member: GuildMember})=>{
            const user=element.member.user;
            let text=`${i}. **`;
            if(user.id===_user.id)
                text+=`__`;
            text+=`${user.username}`;
            if(element.member.nickname)
                text+=` (${element.member.nickname})`;
            if(user.id===_user.id)
                text+=`__`;
            text+=`**`;
            data.push(text);
            data.push(Localisation.getTranslation("leaderboard.output", element.userLevel.level, element.userLevel.xp, getLevelXP(element.userLevel.level)));
            i++;
        });

        //Gets the position of the user if they are not in the top 15
        const index=leaderboardLevels.findIndex(u=>u.userLevel.userId===_user.id);
        if(index<0){
            const userLevel=levels.find(u=>u.userId===_user.id);
            if(userLevel){
                data.push("...");
                const userIndex=levels.findIndex(u=>u.userId===_user.id);
                let text=`${userIndex+1}. **`;
                if(member.id===_user.id)
                    text+=`__`;
                text+=`${_user.username}`;
                if(member.nickname)
                    text+=` (${member.nickname})`;
                if(member.id===_user.id)
                    text+=`__`;
                text+=`**`;
                data.push(text);
                data.push(Localisation.getTranslation("leaderboard.output", userLevel.level, userLevel.xp, getLevelXP(userLevel.level)));
            }else{
                return cmdArgs.message.reply(Localisation.getTranslation("error.null.userLevel"));
            }
        }
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data);
        cmdArgs.channel.send(embed);
    }
}

export=RankCommand;