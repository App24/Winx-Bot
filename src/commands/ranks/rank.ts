import { GuildMember, Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getUserByID, getMemberByID } from "../../GetterUtilts";
import { Rank } from "../../structs/Category";
import { Command, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, asyncForEach, getLevelXP, getBotRoleColor } from "../../Utils";

class RankCommand extends Command{
    public constructor(){
        super("Shows the leaderboard");
        this.category=Rank;
        this.usage="[user]";
        this.maxArgs=1;
        this.aliases=["leaderboard", "lb"];
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(message : Message, args : string[]){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        if(!levels) return message.reply("There are no levels in this server!");
        let _user=message.author;
        if(args.length){
            const temp=await getUserByID(args[0]);
            if(!temp) return message.reply("That is not a valid user!");
            _user=temp;
        }
        const member=await getMemberByID(_user.id, message.guild);
        if(!member) return message.reply(`${_user} is not a member of this server!`);

        //Sorts levels list
        levels.sort((a,b)=>{
            if(a.level===b.level){
                return b.xp-a.xp;
            }
            return b.level-a.level;
        });

        //Gets first 15 places in the leaderboard
        const topLevels:{userLevel: UserLevel, member: GuildMember}[]=[];
        let userIndex=0;
        await asyncForEach(levels, async(level : UserLevel)=>{
            const user=await getMemberByID(level.userId, message.guild);
            if(user){
                topLevels.push({userLevel: level, member: user});
                userIndex++;
                if(userIndex>=15)
                    return true;
            }
        });

        const data=[];
        let i=1;
        await asyncForEach(topLevels, async(element:{userLevel: UserLevel, member: GuildMember})=>{
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
            data.push(`Level: ${element.userLevel.level} XP: ${element.userLevel.xp}/${getLevelXP(element.userLevel.level)}`);
            i++;
        });

        //Gets the position of the user if they are not in the top 15
        const index=topLevels.findIndex(u=>u.userLevel.userId===_user.id);
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
                data.push(`Level: ${userLevel.level} XP: ${userLevel.xp}/${getLevelXP(userLevel.level)}`);
            }else{
                return message.reply(`${_user} does not have any levels!`);
            }
        }
        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        message.channel.send(embed);
    }
}

export=RankCommand;