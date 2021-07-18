import { Message, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID } from "../../Constants";
import { getUserByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionState, SuggestionStruct } from "../../structs/databaseTypes/SuggestionStruct";
import { SubCommand } from "../../structs/SubCommand";
import { asyncForEach, capitalise, getBotRoleColor } from "../../Utils";

class SuggestionsCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.minArgs=1;
        this.maxArgs=2;
        this.usage=[new CommandUsage(true, "argument.list", "argument.complete", "argument.reject", "argument.get"), new CommandUsage(false, "argument.requestid", "argument.rejected", "argument.completed", "argument.non")];
        this.category=Owner;
        this.subCommands=[new ListSubCommand(), new CompleteSubCommand(), new RejectSubCommand(), new GetSubCommand()];
    }

    public onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args);
    }
}

class ListSubCommand extends SubCommand{
    public constructor(){
        super("list");
        this.maxArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
        const requests:{key:string, value:SuggestionStruct}[]=await Suggestions.entries();
        let suggestionState : SuggestionState=undefined;
        if(args[0]){
            switch(args[0].toLowerCase()){
                case "non":
                    suggestionState=SuggestionState.Non;
                    break;
                case "completed":
                    suggestionState=SuggestionState.Completed;
                    break;
                case "rejected":
                    suggestionState=SuggestionState.Rejected;
                    break;
            }
        }

        const data=[];
        await asyncForEach(requests, async(request:{key:string, value:SuggestionStruct})=>{
            const key=request.key;
            const suggestion=request.value;
            if(suggestionState===undefined||suggestionState===suggestion.state){;
                const user=await getUserByID(suggestion.userId);
                data.push(Localisation.getTranslation("suggestions.list.suggestion", key, user||suggestion.userId, capitalise(suggestion.state)));
            }
        });

        if(!data.length) return message.reply(Localisation.getTranslation("error.empty.suggestions"));

        const embed=new MessageEmbed();
        embed.setColor((await getBotRoleColor(message.guild)));
        embed.setDescription(data);
        message.channel.send(embed);
    }
}

class CompleteSubCommand extends SubCommand{
    public constructor(){
        super("complete");

        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion:SuggestionStruct=await Suggestions.get(args[0].toLowerCase());
        if(!suggestion) return message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        if(suggestion.state===SuggestionState.Completed) return message.reply(Localisation.getTranslation("suggestions.already.completed"));
        const user=await getUserByID(suggestion.userId);
        const text=Localisation.getTranslation("suggestions.complete", user||suggestion.userId, suggestion.request);
        const embed=new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag||suggestion.userId, user.displayAvatarURL()||"");
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed).then(async(msg)=>{
            msg.react('✅');
            msg.react('❌');
            const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===OWNER_ID), {max: 1});

            collector.on("end", async()=>{
                msg.reactions.removeAll();
            })

            await collector.on("collect", async(reaction)=>{
                if(reaction.emoji.name==="✅"){
                    const embed2=msg.embeds[0];
                    embed2.setDescription(Localisation.getTranslation("suggestions.completed", embed2.description));
                    msg.edit(embed2);
                    suggestion.state=SuggestionState.Completed;
                    await Suggestions.set(args[0], suggestion);
                }
            });
        });
    }
}

class RejectSubCommand extends SubCommand{
    public constructor(){
        super("reject");

        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion:SuggestionStruct=await Suggestions.get(args[0].toLowerCase());
        if(!suggestion) return message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        if(suggestion.state===SuggestionState.Rejected) return message.reply(Localisation.getTranslation("suggestions.already.rejected"));
        const user=await getUserByID(suggestion.userId);
        const text=Localisation.getTranslation("suggestions.reject", user||suggestion.userId, suggestion.request);
        const embed=new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag||suggestion.userId, user.displayAvatarURL()||"");
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed).then(async(msg)=>{
            msg.react('✅');
            msg.react('❌');
            const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===OWNER_ID), {max: 1});

            collector.on("end", async()=>{
                msg.reactions.removeAll();
            })

            await collector.on("collect", async(reaction)=>{
                if(reaction.emoji.name==="✅"){
                    const embed2=msg.embeds[0];
                    embed2.setDescription(Localisation.getTranslation("suggestions.rejected", embed2.description));
                    msg.edit(embed2);
                    suggestion.state=SuggestionState.Rejected;
                    await Suggestions.set(args[0], suggestion);
                }
            });
        });
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");

        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
        const suggestion:SuggestionStruct=await Suggestions.get(args[0].toLowerCase());
        if(!suggestion) return message.reply(Localisation.getTranslation("error.invalid.suggestionId"));
        const user=await getUserByID(suggestion.userId);
        const text=Localisation.getTranslation("suggestions.suggestion", user||suggestion.userId, capitalise(suggestion.state), suggestion.request);
        const embed=new MessageEmbed();
        embed.setDescription(text);
        embed.setTimestamp();
        embed.setFooter(user.tag||suggestion.userId, user.displayAvatarURL()||"");
        embed.setColor((await getBotRoleColor(message.guild)));
        message.channel.send(embed);
    }
}

export=SuggestionsCommand;