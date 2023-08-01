import Jimp from "jimp";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { createMessageEmbed } from "../../utils/Utils";
import { unlinkSync } from "fs";
import axios from "axios";

export class SkinGrabberBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        if (cmdArgs.args.length < 1) {
            return cmdArgs.reply("Need 1 argument");
        }

        const profile: { timestamp: number, profileId: string, profileName: string, textures: { SKIN: { url: string }, CAPE?: { url: string } } } = JSON.parse(<any>Buffer.from("ewogICJ0aW1lc3RhbXAiIDogMTY4ODU4NjI0MzE5NiwKICAicHJvZmlsZUlkIiA6ICJiZmYyYzliNDE4M2E0NzUwYjAyZWUwZmY0YTE0YTgwNiIsCiAgInByb2ZpbGVOYW1lIiA6ICJBcHAyNCIsCiAgInRleHR1cmVzIiA6IHsKICAgICJTS0lOIiA6IHsKICAgICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS9lOGYyNWIwY2ZjNWQ3ZWRmMmIxNzJiZTVhY2NkYjlhNmI2NWZjNjNhMzJjOWY4MGU3ZjNhYmQ1NzU3NzM2MzUyIgogICAgfSwKICAgICJDQVBFIiA6IHsKICAgICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS8yMzQwYzBlMDNkZDI0YTExYjE1YThiMzNjMmE3ZTllMzJhYmIyMDUxYjI0ODFkMGJhN2RlZmQ2MzVjYTdhOTMzIgogICAgfQogIH0KfQ==", "base64"));

        const skinBuffer = Buffer.from((await axios.get(profile.textures.SKIN.url, { responseType: "arraybuffer" })).data, "binary").toString("base64");
        const skin = await Jimp.read(skinBuffer);

        skin.write("App24.png");

        const embed = await createMessageEmbed({ title: "App24" }, cmdArgs.guild);

        embed.setImage("attachment://App24.png");

        await cmdArgs.reply({ embeds: [embed], files: ["App24.png"] });

        unlinkSync("App24.png");

        /*const base = new Jimp(16, 32);
        const head = skin.clone();
        const torso = skin.clone();
        const lArm = skin.clone();
        const rArm = skin.clone();
        const lLeg = skin.clone();
        const rLeg = skin.clone();

        head.crop(...bodyParts.firstLayer.head.front);
        torso.crop(...bodyParts.firstLayer.torso.front);

        // See comment in useSecondLayer function
        const lArmPoints = applySecondLayer
            ? [...bodyParts.firstLayer.arms.left.front]
            : [...bodyParts.firstLayer.arms.right.front];
        const lLegPoints = applySecondLayer
            ? [...bodyParts.firstLayer.legs.left.front]
            : [...bodyParts.firstLayer.legs.right.front];

        const rArmPoints = [...bodyParts.firstLayer.arms.right.front];

        // Correction for slim skin arms;
        if (isSlim) {
            lArmPoints[2] = lArmPoints[2] - 1;
            rArmPoints[2] = rArmPoints[2] - 1;
        }

        lArm.crop(...lArmPoints);
        rArm.crop(...rArmPoints);
        lLeg.crop(...lLegPoints);
        rLeg.crop(...bodyParts.firstLayer.legs.right.front);

        !applySecondLayer && lArm.flip(true, false) && lLeg.flip(true, false);

        base.composite(head, 4, 0);
        base.composite(torso, 4, 8);
        base.composite(lArm, 12, 8);
        base.composite(rArm, isSlim ? 1 : 0, 8);
        base.composite(lLeg, 8, 20);
        base.composite(rLeg, 4, 20);

        if (overlay && applySecondLayer) {
            try {
                const head2 = skin.clone();
                const torso2 = skin.clone();
                const lArm2 = skin.clone();
                const rArm2 = skin.clone();
                const lLeg2 = skin.clone();
                const rLeg2 = skin.clone();

                const lArmPoints2 = [...bodyParts.secondLayer.arms.left.front];
                const rArmPoints2 = [...bodyParts.secondLayer.arms.right.front];

                if (isSlim) {
                    lArmPoints2[2] = lArmPoints2[2] - 1;
                    rArmPoints2[2] = rArmPoints2[2] - 1;
                }

                head2.crop(...bodyParts.secondLayer.head.front);
                torso2.crop(...bodyParts.secondLayer.torso.front);
                lArm2.crop(...lArmPoints2);
                rArm2.crop(...rArmPoints2);
                lLeg2.crop(...bodyParts.secondLayer.legs.left.front);
                rLeg2.crop(...bodyParts.secondLayer.legs.right.front);

                base.composite(head2, 4, 0);
                base.composite(torso2, 4, 8);
                base.composite(lArm2, 12, 8);
                base.composite(rArm2, isSlim ? 1 : 0, 8);
                base.composite(lLeg2, 4, 20);
                base.composite(rLeg2, 8, 20);
            } catch (e) {
                log.debug(`2D Render - ${uuid} had no second layer.`);
            }
        }

        base.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);

        return base.getBase64Async(Jimp.MIME_PNG);*/
    }
}