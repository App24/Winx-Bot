import { GuildMember, MessageActionRow, MessageButton, TextBasedChannels, User } from "discord.js";
import { Localisation } from "../localisation";

export async function waitForPlayers(maxNumber : number, channel : TextBasedChannels, author : User, startGame:(members:GuildMember[])=>void){
    const buttons=new MessageActionRow().addComponents(new MessageButton({customId: "join", style: "PRIMARY", label: Localisation.getTranslation("button.join")}));

    let remainingPlayers=maxNumber;

    const message=await channel.send({content: Localisation.getTranslation("generic.waitingplayers", remainingPlayers), components: [buttons]});

    let deleted=false;

    const collector=message.createMessageComponentCollector({filter: i=>i.user.id!==author.id, max: maxNumber, time: 10*60*1000});

    const membersJoined=[];

    collector.on("end", async(collected)=>{
        if(deleted) return;
        await message.edit({components: []});
        if(collected.size===0){
            message.edit(Localisation.getTranslation("generic.noonejoin"));
        }
    });

    collector.on("collect", (interaction)=>{
        remainingPlayers--;
        membersJoined.push(interaction.member);
        if(remainingPlayers<=0){
            deleted=true;
            message.delete();
            startGame(membersJoined);
        }
    });
}