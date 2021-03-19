import Canvas from 'canvas';
import Discord from 'discord.js';
import Command from '../../Command';
import { CARD_HEX } from '../../Constants';
import * as Utils from '../../Utils';

class CardColor extends Command{
    constructor(){
        super();
        this.paid=true;
        this.description="Set the background color of your card!";
        this.category=Command.CustomisationCategory;
        this.usage="[hex/reset]";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const UserSettings=bot.getDatabase("userSettings");
        const serverUserSettings=await Utils.getServerDatabase(UserSettings, message.guild.id);
        let userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        if(!userSettings){
            await serverUserSettings.push({"id": message.author.id, "settings":[]});
            userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        }
        if(args.length<=0){
            let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(!cardColor){
                return message.channel.send(`You not have a custom background color!`);
            }
            this.showColor(message, cardColor["color"]);
            return;
        }
        let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
        if(!cardColor){
            await userSettings["settings"].push({"id": "cardColor", "color": CARD_HEX});
            cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
        }
        if(args[0].toLowerCase()==="reset"){
            cardColor["color"]=CARD_HEX;
            await UserSettings.set(message.guild.id, serverUserSettings);
            return message.channel.send(`Resetted color to default: #${cardColor["color"]}`);
        }else{
            let hex=args[0];
            if(hex.startsWith("#")){
                hex=hex.substring(1);
            }
            if(hex.length!==6){
                return message.reply("That is not a valid color!");
            }
            cardColor["color"]=hex;
            message.channel.send("Settings Updated!");
            this.showColor(message, cardColor["color"]);
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
    }

    private showColor(message, color){
        const canvas = Canvas.createCanvas(700, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle="#"+color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
        message.channel.send(`#${color}`, attachment);
    }

}

module.exports=CardColor;