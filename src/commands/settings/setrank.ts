import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleByID, getRoleFromMention } from "../../GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, getBotRoleColor, getServerDatabase } from "../../Utils";

class SetRankCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.minArgs=1;
        this.availability=CommandAvailability.Guild;
        this.access=CommandAccess.Moderators;
        this.usage=[new CommandUsage(true, "argument.set", "argument.remove", "argument.get", "argument.list"), new CommandUsage(false, "argument.level"), new CommandUsage(false, "argument.role", "argument.gif")];
        this.subCommands=[new SetSubCommand(), new RemoveSubCommand(), new GetSubCommand(), new ListSubCommand()];
    }

    public async onRun(cmdArgs : CommandArguments){
        const name=cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=2;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);
        const level=parseInt(cmdArgs.args[0]);

        let rankLevel=ranks.find(rank=>rank.level===level);

        if(new RegExp(/[a-zA-Z]+/g).test(cmdArgs.args[1])){ //Has to be link
            if(!rankLevel) return cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.norole"));
            cmdArgs.args.shift();
            cmdArgs.args.forEach(gif=>{
                rankLevel.gifs.push(gif.toLowerCase());
            })
            await Ranks.set(cmdArgs.guild.id, ranks);
            return cmdArgs.channel.send(Localisation.getTranslation("setrank.gifs.add"));
        }else{
            const role=await getRoleFromMention(cmdArgs.args[1], cmdArgs.guild);
            if(!role) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.role"));
            if(rankLevel){
                const index=ranks.findIndex(rank=>rank.level===rankLevel.level);
                rankLevel.level=level;
                rankLevel.roleId=role.id;
                ranks.splice(index, 1);
            }else{
                rankLevel=new RankLevel(level, role.id);
            }
            ranks.push(rankLevel);
            await Ranks.set(cmdArgs.guild.id, ranks);
            return cmdArgs.channel.send(Localisation.getTranslation("setrank.role.set"));
        }
    }
}

class RemoveSubCommand extends SubCommand{
    public constructor(){
        super("remove");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);
        const level=parseInt(cmdArgs.args[0]);
        if(isNaN(level)||level<0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));

        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
        if(rankLevelIndex<0) return cmdArgs.message.reply(Localisation.getTranslation("setrank.rank.none"));
        const rankLevel=ranks[rankLevelIndex];
        
        if(cmdArgs.args[1]&&new RegExp(/[a-zA-Z]+/g).test(cmdArgs.args[1])){ //Has to be link
            cmdArgs.args.shift();
            cmdArgs.args.forEach(_gif=>{
                const index=rankLevel.gifs.findIndex(gif=>gif.toLowerCase()===_gif.toLowerCase());
                if(index>-1) rankLevel.gifs.splice(index, 1);
            })
            await Ranks.set(cmdArgs.guild.id, ranks);
            return cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.remove"));
        }else{
            ranks.splice(rankLevelIndex, 1);
            await Ranks.set(cmdArgs.guild.id, ranks);
            return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.remove"));
        }
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);
        
        const level=parseInt(cmdArgs.args[0]);
        if(isNaN(level)||level<0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));

        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
        if(rankLevelIndex<0) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));
        const rankLevel=ranks[rankLevelIndex];

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        const data=[];
        data.push(Localisation.getTranslation("setrank.list.role", rankLevel.roleId));
        if(rankLevel.gifs&&rankLevel.gifs.length){
            data.push(Localisation.getTranslation("setrank.list.gifs"));
            rankLevel.gifs.forEach(gif=>{
                data.push(gif);
            });
        }
        embed.setDescription(data);
        cmdArgs.channel.send(embed);
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);

        if(!ranks||!ranks.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));

        ranks.sort((a, b)=>a.level-b.level);
        const data=[];
        await asyncForEach(ranks, async(rank:RankLevel)=>{
            const role=await getRoleByID(rank.roleId, cmdArgs.guild);
            if(role){
                data.push(Localisation.getTranslation("transformations.list", rank.level, role));
            }
        });

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        embed.setDescription(data);
        cmdArgs.channel.send(embed);
    }
}

export=SetRankCommand;