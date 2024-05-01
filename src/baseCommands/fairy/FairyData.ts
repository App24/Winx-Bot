import { EmbedBuilder } from "discord.js";
import { FairyData } from "../../structs/databaseTypes/FairyData";
import { createFairy, getFairyImage } from "../../utils/FairyUtils";
import { canvasToMessageAttachment, createMessageEmbed, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { Fairy } from "../../structs/fairy/Fairy";
import { CommandAccess } from "../../structs/CommandAccess";

export class FairyDataBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const fairyData = await getOneDatabase(FairyData, { userId: cmdArgs.author.id });

        if (fairyData.isNull()) {
            // create fairy

            fairyData.document = (await createFairy(cmdArgs.author.id, cmdArgs.guild, cmdArgs.body)).document;

            if (fairyData.isNull()) return;
        }

        const fairy = Fairy.from(fairyData);

        const embed = new EmbedBuilder();

        embed.setTitle(fairy.name);

        embed.setImage("attachment://fairy.png");

        cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)], files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
    }
}