import { GuildMember } from "discord.js";

export class CardData {
    member: GuildMember;
    xp: number;
    level: number;
    withWings = true;
    lbRank = 0;
    weeklyLbRank = 0;
    cardCode: string;
}

export async function drawCard(cardData: CardData) {

}