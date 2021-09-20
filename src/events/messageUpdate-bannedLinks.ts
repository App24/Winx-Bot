import { BotUser } from "../BotClient";
import fs from "fs";
import { MessageEmbed } from "discord.js";
import { getBotRoleColor } from "../utils/GetterUtils";
import { isDM } from "../utils/Utils";

export=()=>{
    BotUser.on("messageUpdate", async(_, newMessage)=>{
        if(isDM(newMessage.channel)||(newMessage.member && newMessage.member.permissions.has("MANAGE_MESSAGES"))) return;
        const jsonData:any=fs.readFileSync("websites.json");
        const bannedWebsites:string[]=JSON.parse(jsonData);

        if(bannedWebsites.some(v=>newMessage.content.includes(v))){
            newMessage.delete();
            const embed=new MessageEmbed();
            embed.setColor(await getBotRoleColor(newMessage.guild));
            embed.setDescription(`${newMessage.author} you cannot post this link!`);
            newMessage.channel.send({embeds: [embed]}).then(msg=>setTimeout(()=>msg.delete(), 10000));
        }
    });
}