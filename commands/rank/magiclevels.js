const Command=require("../../Command");
const Utils=require("../../Utils");
const Canvas=require("canvas");
const Discord=require("discord.js");

class MagicLevels extends Command{
    constructor(){
        super("magiclevels");
        this.category=Command.RankCategory;
        this.usage="[user]";
        this.description="Shows how far you are to the next level";
    }

    async onRun(bot, message, args){
        let user=await Utils.getUserFromMention(args[0], bot);
        if(!user) user=message.author;
        if(user) if(user.bot) return message.channel.send(`\`${user.username}\` is a bot, they do no have levels`);
        const Levels=bot.tables["levels"];
        const Ranks=bot.tables["ranks"];
        let ranks=await Ranks.get(message.guild.id);
        if(!ranks){
            ranks=[];
        }
        let serverInfo=await Levels.get(message.guild.id);
        if(!serverInfo){
            await Levels.set(message.guild.id, []);
            serverInfo=await Levels.get(message.guild.id);
        }
        let userInfo=await serverInfo.find(u=>u["id"]===user.id);
        if(!userInfo){
            await serverInfo.push({"id":user.id, "xp":0, "level":0});
            userInfo=await serverInfo.find(u=>u["id"]===user.id);
        }
        await ranks.sort((a,b)=>{
            return (a["level"]>b["level"])?1:-1;
        });
        const UserSettings=bot.tables["userSettings"];
        let serverUserSettings=await UserSettings.get(message.guild.id);
        if(!serverUserSettings){
            await UserSettings.set(message.guild.id, []);
            serverUserSettings=await UserSettings.get(message.guild.id);
        }
        let userSettings=await serverUserSettings.find(settings=>settings["id"]===user.id);
        let hex="363636";
        if(userSettings){
            let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(cardColor){
                hex=cardColor["color"];
            }
        }
        const member=await Utils.getMemberByID(user.id, message.guild);
        if(!member) return message.channel.send(`\`${user.username}\` is not a member of this server!`);
        let text="";
        text+=`${user.username}`;
        if(member.nickname)
            text+=` (${member.nickname})`;
        text+=`: Level: ${userInfo["level"]}`;
        // message.channel.send(text);

        let currentTransRole,nextTransRole;
        let nextTransformationIndex=-1;
        await Utils.asyncForEach(ranks, async(rank, index)=>{
            if(rank["level"]<=userInfo["level"]){
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
                var rgb=Utils.hexToRgb(barColor["startColor"]);
                startHsl=this._rgbToHsl(rgb.r,rgb.g,rgb.b);
            }
        }
        var endHsl=[100/360,1,0.4];
        if(userSettings){
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(barColor){
                var rgb=Utils.hexToRgb(barColor["endColor"]);
                endHsl=this._rgbToHsl(rgb.r,rgb.g,rgb.b);
            }
        }

        const maxInfoSize=800;
        
        const nameFont=Utils.fitText(canvas, text, 70, maxInfoSize);

        const pfpRadius=nameFont[1]*2;
        const pfpX=5;
        const pfpY=5;

        const paidRadius=pfpRadius*0.4;
        const paidX=pfpX+(pfpRadius*2)-(paidRadius*2);
        const paidY=pfpY;
        const paidFontSize=pfpRadius*0.5;

        canvas.width=pfpX+(pfpRadius*2)+pfpX+maxInfoSize+pfpX;
        canvas.height=pfpY+(pfpRadius*2)+pfpY;
        const transformationFontSize=Math.min(Utils.fitText(canvas, currentTransText, canvas.height*0.2068965517241379, maxInfoSize)[1], Utils.fitText(canvas, nextTransText, canvas.height*0.2068965517241379, maxInfoSize)[1]);
        const transformationFont=[`${transformationFontSize}px sans-serif`, transformationFontSize];
        const textPos=nameFont[1]+((canvas.height-(nameFont[1]+(transformationFont[1]*3.5)))/2.0);
        const barHeight=canvas.height*0.15;
        const levelFont=`${barHeight}px sans-serif`;

        ctx.fillStyle="#"+hex;
        this._roundRect(ctx,0,0,canvas.width,canvas.height, 20).fill();

        ctx.font=nameFont[0];
        ctx.fillStyle="#ffffff";
        ctx.fillText(text, pfpX+(pfpRadius*2)+pfpX, textPos);

        const barWidth=maxInfoSize;
        const filled=userInfo["xp"]/Utils.getLevelXP(userInfo["level"]);
        ctx.fillStyle="#272822";
        this._roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth, barHeight, 20).fill();

        ctx.fillStyle=`hsla(${Utils.blend(startHsl[0], endHsl[0], 1-filled)*360}, ${Utils.blend(startHsl[1], endHsl[1], 1-filled)*100}%, ${Utils.blend(startHsl[2], endHsl[2], 1 - filled)*100}%, 1)`;
        this._roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth*filled, barHeight, 20).fill();

        ctx.font=levelFont;
        ctx.fillStyle="#ffffff";
        ctx.textBaseline='middle';
        ctx.textAlign="center";
        ctx.fillText(`${userInfo["xp"]}/${Utils.getLevelXP(userInfo["level"])}`, (pfpX+(pfpRadius*2)+pfpX)+(barWidth/2.0), textPos+10+(barHeight*0.5));

        ctx.font=transformationFont[0];
        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillText(currentTransText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight);

        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillText(nextTransText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight+transformationFont[1]);

        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpRadius+pfpX, pfpRadius+pfpY, pfpRadius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.clip();

        const avatar=await Canvas.loadImage(member.user.displayAvatarURL({format: 'png'}));
        ctx.drawImage(avatar, pfpX, pfpY, pfpRadius*2, pfpRadius*2);
        ctx.restore();

        if(user.id===process.env.OWNER_ID){
            this._drawSpecialCircle(ctx, paidX, paidY, paidRadius, "#00a82d", "C", paidFontSize);
        }else if(user.id===message.guild.ownerID){
            this._drawSpecialCircle(ctx, paidX, paidY, paidRadius, "#a8002d", "O", paidFontSize);
        }else if(userPaid){
            this._drawSpecialCircle(ctx, paidX, paidY, paidRadius, "#f5c118", "$", paidFontSize, "#000000");
        }

        const attachment=new Discord.MessageAttachment(canvas.toBuffer(), "magiclevels.png");

        message.channel.send(attachment);
    }

    _drawSpecialCircle(ctx, x, y, radius, color, text, fontSize, textColor="#ffffff"){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x+radius, y+radius, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle=color;
        ctx.fillRect(x,y,radius*2,radius*2);
        ctx.restore();
        ctx.font=`bold ${fontSize}px sans-serif`;
        ctx.fillStyle=textColor;
        ctx.textBaseline="middle";
        ctx.textAlign="center";
        ctx.fillText(text, x+radius, y+radius);
    }

    _roundRect(ctx, x, y, w, h, r){
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y,   x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x,   y+h, r);
        ctx.arcTo(x,   y+h, x,   y,   r);
        ctx.arcTo(x,   y,   x+w, y,   r);
        ctx.closePath();
        return ctx;
    }

    _rgbToHsl(r, g, b){
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