import { Message, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { Localisation } from "../../localisation";
import { CommandArguments } from "../../structs/Command";
import { waitForPlayers } from "../../utils/MinigameUtils";
import { createMessageEmbed } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class RPSBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        if (cmdArgs instanceof CommandArguments) {
            waitForPlayers(1, 1, "minigame.rps.name", cmdArgs.guild, cmdArgs.channel, cmdArgs.member, (members) => {
                const data = new RPSData(members[0].id, members[1].id);

                this.playGame(data, cmdArgs.body);
            });
        }
    }

    async playGame(gameData: RPSData, message: Message) {
        const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>();
        buttons.addComponents(new ButtonBuilder({ customId: RPSMoves.Rock.toString(), style: ButtonStyle.Primary, emoji: "🪨" }));
        buttons.addComponents(new ButtonBuilder({ customId: RPSMoves.Paper.toString(), style: ButtonStyle.Primary, emoji: "📜" }));
        buttons.addComponents(new ButtonBuilder({ customId: RPSMoves.Scissors.toString(), style: ButtonStyle.Primary, emoji: "✂" }));

        const embed = await createMessageEmbed({ description: Localisation.getLocalisation("rps.play") }, message.guild);

        const msg = await message.reply({ embeds: [embed], components: [buttons] });

        const collector = msg.createMessageComponentCollector({ filter: () => true, time: 5 * 1000 * 60 });

        let plays = 0;

        collector.on("end", () => {
            const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];
            msg.components.forEach(component => {
                const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();
                component.components.forEach(c => {
                    if (c.type === ComponentType.Button) {
                        row.addComponents(ButtonBuilder.from(c).setDisabled(true));
                    }
                });
                components.push(row);
            });
            msg.edit({ components: components });
        });

        collector.on("collect", async (interaction) => {
            if (!interaction.isButton()) return;
            if (![gameData.player1.id, gameData.player2.id].includes(interaction.user.id)) {
                await interaction.reply({ ephemeral: true, content: Localisation.getLocalisation("generic.not.author") });
                return;
            }
            const currentPlayer = interaction.user.id === gameData.player1.id ? gameData.player1 : gameData.player2;

            if (currentPlayer.move !== RPSMoves.None) {
                await interaction.reply({ content: Localisation.getLocalisation("rps.alreadyplayed"), ephemeral: true });
                return;
            }

            const move = <RPSMoves>interaction.customId;
            currentPlayer.move = move;
            plays++;

            await interaction.reply({ content: Localisation.getLocalisation("rps.played"), ephemeral: true });

            if (plays >= 2) {
                const player1Move = gameData.player1.move;
                const player2Move = gameData.player2.move;

                let finished = false;

                const checkWinner = (winner: RPSMoves, looser: RPSMoves) => {
                    if (finished) return;
                    if (player1Move === winner && player2Move === looser) {
                        finished = true;
                        message.reply({ content: Localisation.getLocalisation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player1.id] } });
                        collector.emit("end", "");
                    } else if (player2Move === winner && player1Move === looser) {
                        finished = true;
                        message.reply({ content: Localisation.getLocalisation("minigame.win", gameData.player1.id), allowedMentions: { users: [gameData.player2.id] } });
                        collector.emit("end", "");
                    }
                };

                if (player1Move === player2Move) {
                    await message.reply({ content: Localisation.getLocalisation("minigame.draw") });
                }

                checkWinner(RPSMoves.Paper, RPSMoves.Rock);
                checkWinner(RPSMoves.Rock, RPSMoves.Scissors);
                checkWinner(RPSMoves.Scissors, RPSMoves.Paper);
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