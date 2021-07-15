import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleByID, getRoleFromMention } from "../../GetterUtilts";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getServerDatabase } from "../../Utils";

class SetRankCommand extends Command{
    public constructor(){
        super("Set rank for each level");
        this.category=Settings;
        this.minArgs=1;
        this.availability=CommandAvailability.Guild;
        this.access=CommandAccess.Moderators;
        this.usage="<set/remove/get/list> [level above 0] [role/gif links]";
        this.subCommands=[new SetSubCommand(), new RemoveSubCommand(), new GetSubCommand(), new ListSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args);
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=2;
    }

    public async onRun(message : Message, args : string[]){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, message.guild.id);
        const level=parseInt(args[0]);

        let rankLevel=ranks.find(rank=>rank.level===level);

        if(new RegExp(/[a-zA-Z]+/g).test(args[1])){ //Has to be link
            if(!rankLevel) return message.reply("There is no role assigned to this level, cannot add gifs!");
            args.shift();
            args.forEach(gif=>{
                rankLevel.gifs.push(gif.toLowerCase());
            })
            await Ranks.set(message.guild.id, ranks);
            return message.channel.send("Added gifs!");
        }else{
            const role=await getRoleFromMention(args[1], message.guild);
            if(!role) return message.reply("That is not a valid role!");
            if(rankLevel){
                const index=ranks.findIndex(rank=>rank.level===rankLevel.level);
                rankLevel.level=level;
                rankLevel.roleId=role.id;
                ranks.splice(index, 1);
            }else{
                rankLevel=new RankLevel(level, role.id);
            }
            ranks.push(rankLevel);
            await Ranks.set(message.guild.id, ranks);
            return message.channel.send("Setted rank!");
        }
    }
}

class RemoveSubCommand extends SubCommand{
    public constructor(){
        super("remove");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, message.guild.id);
        const level=parseInt(args[0]);
        if(isNaN(level)||level<0) return message.reply("That is not a valid level!");

        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
        if(rankLevelIndex<0) return message.reply("There is no rank with this level!");
        const rankLevel=ranks[rankLevelIndex];
        
        if(args[1]&&new RegExp(/[a-zA-Z]+/g).test(args[1])){ //Has to be link
            args.shift();
            args.forEach(_gif=>{
                const index=rankLevel.gifs.findIndex(gif=>gif.toLowerCase()===_gif.toLowerCase());
                if(index>-1) rankLevel.gifs.splice(index, 1);
            })
            await Ranks.set(message.guild.id, ranks);
            return message.reply("Removed Gifs!");
        }else{
            ranks.splice(rankLevelIndex, 1);
            await Ranks.set(message.guild.id, ranks);
            return message.reply("Removed Rank!");
        }
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, message.guild.id);
        
        const level=parseInt(args[0]);
        if(isNaN(level)||level<0) return message.reply("That is not a valid level!");

        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
        if(rankLevelIndex<0) return message.reply("There is no rank with this level!");
        const rankLevel=ranks[rankLevelIndex];

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        const data=[];
        data.push(`**Role**: <@&${rankLevel.roleId}>`);
        if(rankLevel.gifs&&rankLevel.gifs.length){
            data.push("__Gifs__");
            rankLevel.gifs.forEach(gif=>{
                data.push(gif);
            });
        }
        embed.setDescription(data);
        message.channel.send(embed);
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(message : Message, args : string[]){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, message.guild.id);

        if(!ranks||!ranks.length) return message.reply("There are no ranks in this server!");

        ranks.sort((a, b)=>a.level-b.level);
        const data=[];
        await asyncForEach(ranks, async(rank:RankLevel)=>{
            const role=await getRoleByID(rank.roleId, message.guild);
            if(role){
                data.push(`Level ${rank.level}: ${role}`);
            }
        });

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        message.channel.send(embed);
    }
}

export=SetRankCommand;