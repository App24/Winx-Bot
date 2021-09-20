import { Canvas, NodeCanvasRenderingContext2D } from "canvas";
import { Message, MessageActionRow, MessageButton } from "discord.js";
import { Localisation } from "../../localisation";
import { Minigames } from "../../structs/Category";
import { Command,  CommandArguments, CommandAvailability } from "../../structs/Command";
import { canvasToMessageAttachment } from "../../utils/Utils";

class TicTacToe extends Command{

    private nSquares=3;

    private squareSize : number;
    private lineWidth : number;

    private canvasSize : number;

    public constructor(){
        super();
        this.availability=CommandAvailability.Guild;
        this.category=Minigames;
        this.aliases=["n&c", "ttt"];

        this.nSquares=3;
        this.squareSize=150;
        this.lineWidth=31;
        this.canvasSize=this.squareSize*this.nSquares+this.lineWidth*(this.nSquares-1);
    }

    public async onRun(cmdArgs : CommandArguments){

        const buttons=new MessageActionRow().addComponents(new MessageButton({customId: "join", style: "PRIMARY", label: Localisation.getTranslation("button.join")}));

        const message=await cmdArgs.channel.send({content: Localisation.getTranslation("generic.waitingplayers", 1), components: [buttons]});

        let deleted=false;

        const collector=message.createMessageComponentCollector({filter: i=>i.user.id!==cmdArgs.author.id, max: 1, time: 10*60*1000});

        collector.on("end", async(collected)=>{
            if(deleted) return;
            await message.edit({components: []});
            if(collected.size===0){
                message.edit(Localisation.getTranslation("generic.noonejoin"));
            }
        });

        collector.on("collect", (interaction)=>{
            deleted=true;
            const currentGame=new TicTacToeData(cmdArgs.author.id, interaction.user.id, this.nSquares);
            
            message.delete();
    
            this.playGame(currentGame, currentGame.player1, cmdArgs.message);
        });
    }

    async playGame(currentGame : TicTacToeData, currentPlayer : string, message : Message){
        const canvasInfo:any=this.drawCanvas(currentGame, currentPlayer);
        const canvas:Canvas=canvasInfo[0];
        const buttons:MessageActionRow[]=canvasInfo[1];

        const msg=await message.reply({content: Localisation.getTranslation("tictactoe.turn", currentPlayer),files: [canvasToMessageAttachment(canvas, "tictactoe")], components: buttons, allowedMentions: {users: [currentPlayer]}});

        const collector=msg.createMessageComponentCollector({filter: i=>i.user.id===currentPlayer, time: 5*60*1000});

        collector.on("collect", async(interaction)=>{
            const data:any[]=interaction.customId.split("_");
            const x=Number.parseInt(data[0]);
            const y=Number.parseInt(data[1]);
            const val=data[2];

            if(val!=TicTacToeValue.Empty){
                return;
            }

            const index=y*this.nSquares+x;

            const playerVal=currentPlayer===currentGame.player1?TicTacToeValue.X:TicTacToeValue.O;

            currentGame.positions[index]=playerVal;

            await interaction.update({components: []});

            msg.delete();

            for(let i=0;i<this.nSquares;i++){
                if(currentGame.positions[i*this.nSquares+x]!==playerVal)
                    break;
                if(i===this.nSquares-1){
                    message.reply({content: Localisation.getTranslation("tictactoe.win", currentPlayer), files:[canvasToMessageAttachment(<any>this.drawCanvas(currentGame, currentPlayer)[0], "tictactoe")], allowedMentions: {users: [currentGame.player1, currentGame.player2]}});
                    return;
                }
            }

            for(let i=0;i<this.nSquares;i++){
                if(currentGame.positions[y*this.nSquares+i]!==playerVal)
                    break;
                if(i===this.nSquares-1){
                    message.reply({content: Localisation.getTranslation("tictactoe.win", currentPlayer), files:[canvasToMessageAttachment(<any>this.drawCanvas(currentGame, currentPlayer)[0], "tictactoe")], allowedMentions: {users: [currentGame.player1, currentGame.player2]}});
                    return;
                }
            }

            if(x==y){
                for(let i=0;i<this.nSquares;i++){
                    if(currentGame.positions[i*this.nSquares+i]!==playerVal)
                        break;
                    if(i===this.nSquares-1){
                        message.reply({content: Localisation.getTranslation("tictactoe.win", currentPlayer), files:[canvasToMessageAttachment(<any>this.drawCanvas(currentGame, currentPlayer)[0], "tictactoe")], allowedMentions: {users: [currentGame.player1, currentGame.player2]}});
                        return;
                    }
                }
            }

            if(x+y===this.nSquares-1){
                for(let i=0;i<this.nSquares;i++){
                    if(currentGame.positions[((this.nSquares-1)-i)*this.nSquares+i]!==playerVal)
                        break;
                    if(i===this.nSquares-1){
                        message.reply({content: Localisation.getTranslation("tictactoe.win", currentPlayer), files:[canvasToMessageAttachment(<any>this.drawCanvas(currentGame, currentPlayer)[0], "tictactoe")], allowedMentions: {users: [currentGame.player1, currentGame.player2]}});
                        return;
                    }
                }
            }
            
            if(currentGame.positions.filter((val)=>val===TicTacToeValue.Empty).length>0)
                this.playGame(currentGame, currentPlayer===currentGame.player1?currentGame.player2:currentGame.player1, message);
            else
                message.reply({content: Localisation.getTranslation("tictactoe.draw"), files:[canvasToMessageAttachment(<any>this.drawCanvas(currentGame, currentPlayer)[0], "tictactoe")], allowedMentions: {users: [currentGame.player1, currentGame.player2]}});
        });
    }

    drawCanvas(currentGame : TicTacToeData, currentPlayer : string){
        const canvas=new Canvas(this.canvasSize, this.canvasSize);
        const ctx=canvas.getContext("2d");

        ctx.fillStyle="#b00b69";
        for(let i=0;i<(this.nSquares-1);i++){
            const pos=this.squareSize*(i+1)+this.lineWidth*i;
            ctx.fillRect(pos, 0, this.lineWidth, this.canvasSize);
            ctx.fillRect(0, pos, this.canvasSize, this.lineWidth);
        }

        const buttons:MessageActionRow[]=[];
        for(let i=0;i<this.nSquares;i++){
            buttons.push(new MessageActionRow());
        }

        currentGame.positions.forEach((val, i)=>{
            const x=i%this.nSquares;
            const y=Math.floor(i/this.nSquares);

            const xPos=this.squareSize/2+(x*this.squareSize)+this.lineWidth*x;
            const yPos=this.squareSize/2+(y*this.squareSize)+this.lineWidth*y;

            const id=`${x}_${y}_${val}`;
            
            switch(val){
            case TicTacToeValue.X:{
                this.drawCross(ctx, xPos, yPos);
                buttons[y].addComponents(new MessageButton({customId: id, style: "DANGER", emoji: "❌"}));
            }break;
            case TicTacToeValue.O:{
                this.drawCircle(ctx, xPos, yPos);
                buttons[y].addComponents(new MessageButton({customId: id, style: "DANGER", emoji: "🔵"}));
            }break;
            default:{
                buttons[y].addComponents(new MessageButton({customId: id, style: "SUCCESS", emoji: currentPlayer===currentGame.player1?"❌":"🔵"}));
            }break;
            }
        });

        return [canvas, buttons];
    }

    drawCross(ctx:NodeCanvasRenderingContext2D, x:number, y:number){
        ctx.fillStyle="#ff0000";
        const width=this.squareSize/5;
        const height=this.squareSize;
        const xPos=x-width/2;
        const yPos=y-height/2;

        ctx.translate(xPos+width/2, yPos+height/2);
        ctx.rotate(Math.PI/4);
        ctx.translate(-(xPos+width/2), -(yPos+height/2));
        ctx.fillRect(xPos, yPos, width, height);

        ctx.translate(xPos+width/2, yPos+height/2);
        ctx.rotate(Math.PI/2);
        ctx.translate(-(xPos+width/2), -(yPos+height/2));
        ctx.fillRect(xPos, yPos, width, height);

        ctx.translate(xPos+width/2, yPos+height/2);
        ctx.rotate(-Math.PI/2);
        ctx.rotate(-Math.PI/4);
        ctx.translate(-(xPos+width/2), -(yPos+height/2));
    }

    drawCircle(ctx:NodeCanvasRenderingContext2D, x:number, y:number){
        ctx.strokeStyle="#0000ff";
        ctx.lineWidth=this.squareSize/5;
        const r=this.squareSize/2.5;
        const xPos=x;
        const yPos=y;
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, r, 0, Math.PI*2, true);
        ctx.stroke();
    }
}

class TicTacToeData{
    public player1 : string;
    public player2 : string;
    public positions : TicTacToeValue[];

    public constructor(player1:string, player2:string, nSquares:number){
        this.player1=player1;
        this.player2=player2;
        this.positions=Array(nSquares*nSquares).fill(TicTacToeValue.Empty);
    }
}

enum TicTacToeValue{
    X,
    O,
    Empty
}

export=TicTacToe;