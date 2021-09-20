import { BotUser } from "../BotClient";
import fs from "fs";
import { MessageEmbed } from "discord.js";
import { getBotRoleColor } from "../utils/GetterUtils";
import { isDM } from "../utils/Utils";

export=()=>{
    BotUser.on("messageCreate", async(message)=>{
        if(isDM(message.channel)||(message.member && message.member.permissions.has("MANAGE_MESSAGES"))) return;
        const jsonData:any=fs.readFileSync("websites.json");
        const bannedWebsites:string[]=JSON.parse(jsonData);

        if(bannedWebsites.some(v=>message.content.includes(v))){
            message.delete();
            const embed=new MessageEmbed();
            embed.setColor(await getBotRoleColor(message.guild));
            embed.setDescription(`${message.author} you cannot post this link!`);
            message.channel.send({embeds: [embed]}).then(msg=>setTimeout(()=>msg.delete(), 10000));
        }
    });
}