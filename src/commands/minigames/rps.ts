import { ButtonInteraction, Message, MessageActionRow, MessageButton } from "discord.js";
import { Localisation } from "../../localisation";
import { Minigames } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailable } from "../../structs/Command";
import { waitForPlayers } from "../../utils/MinigameUtils";
import { createMessageEmbed } from "../../utils/Utils";

class RPSCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Minigames;
        this.aliases = ["rockpaperscissors"];
        this.enabled = false;
    }

    public async onRun(cmdArgs: CommandArguments) {
        waitForPlayers(1, 1, "minigame.rps.name", cmdArgs.guild, cmdArgs.channel, cmdArgs.member, (members) => {
            const data = new RPSData(members[0].id, members[1].id);

            this.playGame(data, cmdArgs.message);
        });
    }

    async playGame(gameData: RPSData, message: Message) {
        const buttons = new MessageActionRow();
        buttons.addComponents(new MessageButton({ customId: RPSMoves.Rock.toString(), style: "PRIMARY", emoji: "🪨" }));
        buttons.addComponents(new MessageButton({ customId: RPSMoves.Paper.toString(), style: "PRIMARY", emoji: "📜" }));
        buttons.addComponents(new MessageButton({ customId: RPSMoves.Scissors.toString(), style: "PRIMARY", emoji: "✂" }));

        const embed = await createMessageEmbed({ description: Localisation.getTranslation("rps.play") }, message.guild);

        const msg = await message.reply({ embeds: [embed], components: [buttons] });

        const collector = msg.createMessageComponentCollector({ filter: i => [gameData.player1.id, gameData.player2.id].includes(i.user.id), time: 5 * 10 * 60 });

        let plays = 0;

        collector.on("collect", async function (interaction: ButtonInteraction) {
            const currentPlayer = interaction.user.id === gameData.player1.id ? gameData.player1 : gameData.player2;

            if (currentPlayer.move !== RPSMoves.None) {
                await interaction.reply({ content: Localisation.getTranslation("rps.alreadyplayed"), ephemeral: true });
                return;
            }

            const move = <RPSMoves>interaction.customId;
            currentPlayer.move = move;
            plays++;

            await interaction.reply({ content: Localisation.getTranslation("rps.played"), ephemeral: true });

            if (plays >= 2) {
                const player1Move = gameData.player1.move;
                const player2Move = gameData.player2.move;

                if (player1Move === player2Move) {
                    await message.reply({ content: Localisation.getTranslation("minigame.draw") });
                }

                else if (player1Move === RPSMoves.Scissors && player2Move === RPSMoves.Paper) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player1.id] } });
                } else if (player2Move === RPSMoves.Scissors && player1Move === RPSMoves.Paper) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player2.id] } });
                }

                else if (player1Move === RPSMoves.Paper && player2Move === RPSMoves.Rock) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player1.id] } });
                } else if (player2Move === RPSMoves.Paper && player1Move === RPSMoves.Rock) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player2.id), allowedMentions: { users: [gameData.player2.id] } });
                }

                else if (player1Move === RPSMoves.Rock && player2Move === RPSMoves.Scissors) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player1.id] } });
                } else if (player2Move === RPSMoves.Rock && player1Move === RPSMoves.Scissors) {
                    await message.reply({ content: Localisation.getTranslation("minigame.win", gameData.player2.id), allowedMentions: { users: [gameData.player2.id] } });
                }
            }
        });
    }
}

class RPSData {
    public player1: { id: string, move: RPSMoves };
    public player2: { id: string, move: RPSMoves };

    public constructor(player1: string, player2: string) {
        this.player1 = { id: player1, move: RPSMoves.None };
        this.player2 = { id: player2, move: RPSMoves.None };
    }
}

enum RPSMoves {
    None = "none",
    Rock = "rock",
    Paper = "paper",
    Scissors = "scissors"
}

export = RPSCommand;