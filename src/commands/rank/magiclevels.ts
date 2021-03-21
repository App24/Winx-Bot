import Canvas from 'canvas';
import Discord from 'discord.js';
import Command from '../../Command';
import { CARD_HEX } from '../../Constants';
import * as Utils from '../../Utils';

class MagicLevels extends Command{
    constructor(){
        super();
        this.category=Command.RankCategory;
        this.maxArgsLength=1;
        this.usage="[user]";
        this.description="Shows how far you are to the next level";
        this.aliases=["ml", "levels"];
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        let user=await Utils.getUserFromMention(args[0], bot);
        if(!user) user=message.author;
        if(user.bot) return message.channel.send(`${user} is a a bot and therefore has no levels!`);
        const member=await Utils.getMemberByID(user.id, message.guild);
        if(!member) return message.channel.send(`${user} is not a member of this server!`);
        const Levels=bot.getDatabase("levels");
        const Ranks=bot.getDatabase("ranks");
        const ranks : Array<any>=await Utils.getServerDatabase(Ranks, message.guild.id);
        const levels : Array<any>=await Utils.getServerDatabase(Levels, message.guild.id);
        let userLevel=levels.find(u=>u["id"]===user.id);
        if(!userLevel){
            levels.push({"id":user.id, "xp":0, "level":0});
            userLevel=levels.find(u=>u["id"]===user.id);
        }
        await ranks.sort((a,b)=>{
            return (a["level"]>b["level"])?1:-1;
        });
        const UserSettings=bot.getDatabase("userSettings");
        const serverUserSettings=await Utils.getServerDatabase(UserSettings, message.guild.id);
        let userSettings=serverUserSettings.find(setting=>setting["id"]===user.id);
        let hex=CARD_HEX;
        if(userSettings){
            let cardColor=userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(cardColor){
                hex=cardColor["color"];
            }
        }
        let text="";
        text+=`${user.username}`;
        if(member.nickname)
            text+=` (${member.nickname})`;
        text+=`: Level: ${userLevel["level"]}`;

        let currentTransRole,nextTransRole;
        let nextTransformationIndex=-1;
        await Utils.asyncForEach(ranks, async(rank, index)=>{
            if(rank["level"]<=userLevel["level"]){
                nextTransformationIndex=index;
            }else{
                return true;
            }
        });
        let currentTransformationIndex=nextTransformationIndex+1;
        if(currentTransformationIndex>-1&&currentTransformationIndex<ranks.length){
            let currentTransformation=ranks[currentTransformationIndex];
            if(currentTransformation){
                const role=await Utils.getRoleByID(currentTransformation["role"], message.guild);
                if(role)
                nextTransRole=role;
            }
        }
        if(nextTransformationIndex>-1&&nextTransformationIndex<ranks.length){
            let currentTransformation=ranks[nextTransformationIndex];
            if(currentTransformation){
                const role=await Utils.getRoleByID(currentTransformation["role"], message.guild);
                if(role)
                currentTransRole=role;
            }
        }
        const userPaid=await Utils.isPatreon(user, message.guild, bot);

        const canvas=Canvas.createCanvas(1,1);
        const ctx=canvas.getContext("2d");
        let tempText="None";
        if(nextTransRole){
            tempText=Utils.capitalise(nextTransRole.name);
        }
        const nextTransText=`Next Transformation: ${tempText}`;
        tempText="None";
        if(currentTransRole){
            tempText=Utils.capitalise(currentTransRole.name);
        }
        const currentTransText=`Current Transformation: ${tempText}`;

        var startHsl=[0,1,0.4];
        if(userSettings){
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(barColor){
                var rgb=Utils.hexToRGB(barColor["startColor"]);
                startHsl=this.rgbToHsl(rgb.r,rgb.g,rgb.b);
            }
        }
        var endHsl=[100/360,1,0.4];
        if(userSettings){
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(barColor){
                var rgb=Utils.hexToRGB(barColor["endColor"]);
                endHsl=this.rgbToHsl(rgb.r,rgb.g,rgb.b);
            }
        }

        const maxInfoSize=800;
        
        const nameFont=Utils.fitText(canvas, text, 70, maxInfoSize);
        const pfpRadius=(nameFont[1])*2;
        const pfpX=5;
        const pfpY=5;

        const borderThickness=6;
        const newpfpRadius=pfpRadius-borderThickness;

        canvas.width=pfpX+(pfpRadius*2)+pfpX+maxInfoSize+pfpX;
        canvas.height=pfpY+(pfpRadius*2)+pfpY;
        const transformationFontSize=Math.min(Utils.fitText(canvas, currentTransText, canvas.height*0.2068965517241379, maxInfoSize)[1], Utils.fitText(canvas, nextTransText, canvas.height*0.2068965517241379, maxInfoSize)[1]);
        const transformationFont : Array<any>=[`${transformationFontSize}px sans-serif`, transformationFontSize];
        const textPos=nameFont[1]+((canvas.height-(nameFont[1]+(transformationFont[1]*3.5)))/2.0);
        const barHeight=canvas.height*0.15;
        const levelFont=`${barHeight}px sans-serif`;

        ctx.fillStyle="#"+hex;
        this.roundRect(ctx,0,0,canvas.width,canvas.height, 20).fill();

        ctx.font=nameFont[0];
        ctx.fillStyle="#ffffff";
        ctx.fillText(text, pfpX+(pfpRadius*2)+pfpX, textPos);

        const barWidth=maxInfoSize;
        const filled=userLevel["xp"]/Utils.getLevelXP(userLevel["level"]);
        ctx.fillStyle="#272822";
        this.roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth, barHeight, 20).fill();

        ctx.fillStyle=`hsla(${Utils.blend(startHsl[0], endHsl[0], 1-filled)*360}, ${Utils.blend(startHsl[1], endHsl[1], 1-filled)*100}%, ${Utils.blend(startHsl[2], endHsl[2], 1 - filled)*100}%, 1)`;
        this.roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth*filled, barHeight, 20).fill();

        ctx.font=levelFont;
        ctx.fillStyle="#ffffff";
        ctx.textBaseline='middle';
        ctx.textAlign="center";
        ctx.fillText(`${userLevel["xp"]}/${Utils.getLevelXP(userLevel["level"])}`, (pfpX+(pfpRadius*2)+pfpX)+(barWidth/2.0), textPos+10+(barHeight*0.5));

        ctx.font=transformationFont[0];
        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillText(currentTransText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight);

        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillText(nextTransText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight+transformationFont[1]);

        if(user.id===process.env.OWNER_ID){
            this.drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, "#00a82d");
        }else if(user.id===message.guild.ownerID){
            this.drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, "#a8002d");
        }else if(userPaid){
            this.drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, "#f5c118");
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(newpfpRadius+pfpX+borderThickness, newpfpRadius+pfpY+borderThickness, newpfpRadius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.clip();

        const avatar=await Canvas.loadImage(member.user.displayAvatarURL({format: 'png'}));
        ctx.drawImage(avatar, pfpX+borderThickness, pfpY+borderThickness, newpfpRadius*2, newpfpRadius*2);
        ctx.restore();

        const attachment=new Discord.MessageAttachment(canvas.toBuffer(), "magiclevels.png");

        message.channel.send(attachment);
    }

    private drawSpecialCircle(ctx : Canvas.CanvasRenderingContext2D, x : number, y : number, radius : number, color : string){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x+radius, y+radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle=color;
        ctx.fillRect(x,y,radius*2,radius*2);
        ctx.restore();
    }

    private roundRect(ctx : Canvas.CanvasRenderingContext2D, x : number, y : number, width : number, height : number, radius : number){
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x+radius, y);
        ctx.arcTo(x+width, y, x+width, y+height, radius);
        ctx.arcTo(x+width, y+height, x, y+height, radius);
        ctx.arcTo(x, y+height, x, y, radius);
        ctx.arcTo(x, y, x+width, y, radius);
        ctx.closePath();
        return ctx;
    }

    private rgbToHsl(r : number, g : number, b : number){
        r /= 255, g /= 255, b /= 255;
  
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
    
        if (max == min) {
        h = s = 0; // achromatic
        } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
    
        h /= 6;
        }
    
        return [ h, s, l ];
    }
}

module.exports=MagicLevels;