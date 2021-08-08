import { Message, MessageActionRow, MessageButton, MessageButtonOptions, User } from "discord.js";
import { Localisation } from "../localisation";

export async function createButtons(message : Message, author : User, text : string, settings : {max?: number, time?:number}, ...buttons : MessageButtonOptions[]){
    if(buttons.length>15) buttons.splice(15, buttons.length-15);
    
    const rows:MessageActionRow[]=[];
    for(let i=0; i < Math.ceil(buttons.length/5); i++){
        rows.push(new MessageActionRow());
    }

    buttons.forEach((button, index)=>{
        rows[Math.floor(index/5)].addComponents(new MessageButton(button));
    });

    const msg=await message.reply({content: text, components: rows});

    let filter=i=>true;

    if(author)
        filter=i=>i.user.id===author.id;

    const collector=msg.createMessageComponentCollector({filter: filter, max: settings.max, time: settings.time});

    collector.on("end", _=>{
        msg.edit({components: []})
    });

    return collector;
}

export async function createGenericButtons(message : Message, text : string, settings : {max?: number, time?:number}, ...buttons : MessageButtonOptions[]){
    return createButtons(message, null, text, settings, ...buttons);
}

export async function createWhatToDoButtons(message : Message, author : User, settings : {max?: number, time?:number}, ...buttons : MessageButtonOptions[]){
    return createButtons(message, author, Localisation.getTranslation("generic.whattodo"), settings, ...buttons);
}