import { MessageActionRow, MessageButton } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailable } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { canvasColor } from "../../utils/CanvasUtils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";
import { canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../utils/Utils";

class LeaderboardColor extends Command{
    public constructor(){
        super();
        this.available=CommandAvailable.Guild;
        this.access=CommandAccess.GuildOwner;
        this.category=Settings;
        this.aliases=["leaderboardcolour", "rankcolor", "rankcolour"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        
        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {time: 1000*60*5},
            {customId: "get", style: "PRIMARY", label:Localisation.getTranslation("button.get")},
            {customId: "set", style: "PRIMARY", label:Localisation.getTranslation("button.set")},
            {customId: "reset", style: "PRIMARY", label:Localisation.getTranslation("button.reset")}
        );

        collector.on("collect", async(interaction)=>{
            switch(interaction.customId){
            case "get":{
                const row=new MessageActionRow().addComponents(
                    new MessageButton({customId: "gBackground", style: "PRIMARY", label: Localisation.getTranslation("button.background")}),
                    new MessageButton({customId: "gHighlight", style: "PRIMARY", label: Localisation.getTranslation("button.highlight")})
                );

                interaction.update({components: [row]});
            }break;
            case "set":{
                const row=new MessageActionRow().addComponents(
                    new MessageButton({customId: "sBackground", style: "PRIMARY", label: Localisation.getTranslation("button.background")}),
                    new MessageButton({customId: "sHighlight", style: "PRIMARY", label: Localisation.getTranslation("button.highlight")})
                );

                interaction.update({components: [row]});
            }break;
            case "reset":{
                const row=new MessageActionRow().addComponents(
                    new MessageButton({customId: "rBackground", style: "PRIMARY", label: Localisation.getTranslation("button.background")}),
                    new MessageButton({customId: "rHighlight", style: "PRIMARY", label: Localisation.getTranslation("button.highlight")})
                );

                interaction.update({components: [row]});
            }break;

            case "gBackground":{
                interaction.reply({content: Localisation.getTranslation("generic.hexcolor", serverInfo.leaderboardColor), files: [canvasToMessageAttachment(canvasColor(serverInfo.leaderboardColor))]});
                collector.emit("end", "");
            }break;
            case "gHighlight":{
                interaction.reply({content: Localisation.getTranslation("generic.hexcolor", serverInfo.leaderboardHighlight), files: [canvasToMessageAttachment(canvasColor(serverInfo.leaderboardHighlight))]});
                collector.emit("end", "");
            }break;

            case "sBackground":{
                collector.emit("end", "");
                await interaction.reply(Localisation.getTranslation("argument.reply.hexcolor"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    const hex=msg.content;
                    if(!isHexColor(hex)) return <any>msg.reply(Localisation.getTranslation("error.invalid.hexcolor"));
                    serverInfo.leaderboardColor=hex;
                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("leaderboardcolor.set.color"));
                });
            }break;
            case "sHighlight":{
                collector.emit("end", "");
                await interaction.reply(Localisation.getTranslation("argument.reply.hexcolor"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    const hex=msg.content;
                    if(!isHexColor(hex)) return <any>msg.reply(Localisation.getTranslation("error.invalid.hexcolor"));
                    serverInfo.leaderboardHighlight=hex;
                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("leaderboardcolor.set.highlight"));
                });
            }break;

            case "rBackground":{
                serverInfo.leaderboardColor=DEFAULT_SERVER_INFO.leaderboardColor;
                await ServerInfo.set(cmdArgs.guildId, serverInfo);
                await interaction.update(Localisation.getTranslation("leaderboardcolor.reset.color"));
                collector.emit("end", "");
            }break;
            case "rHighlight":{
                serverInfo.leaderboardHighlight=DEFAULT_SERVER_INFO.leaderboardHighlight;
                await ServerInfo.set(cmdArgs.guildId, serverInfo);
                await interaction.update(Localisation.getTranslation("leaderboardcolor.reset.highlight"));
                collector.emit("end", "");
            }break;
            }
        });
    }
}

export=LeaderboardColor;