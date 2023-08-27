import { ModelWrapper } from "../ModelWrapper";
import { FairyData } from "../databaseTypes/FairyData";
import { FairyPart, FairyPartType } from "./FairyPart";

export class Fairy {
    public userId: string;
    public name: string;
    public bodyBase: FairyPart;
    public eyesPart: FairyPart;
    public lipsPart: FairyPart;
    public nosePart: FairyPart;
    public hairPart: FairyPart;
    public shirtPart: FairyPart;
    public glovesPart: FairyPart;
    public skirtPart: FairyPart;
    public bootsPart: FairyPart;
    public wingsPart: FairyPart;
    public level: number;
    public xp: number;

    public getPart(type: FairyPartType) {
        switch (type) {
            case FairyPartType.BodyBase: return this.bodyBase;
            case FairyPartType.Hair: return this.hairPart;
            case FairyPartType.Eyes: return this.eyesPart;
            case FairyPartType.Nose: return this.nosePart;
            case FairyPartType.Lips: return this.lipsPart;
            case FairyPartType.Shirt: return this.shirtPart;
            case FairyPartType.Gloves: return this.glovesPart;
            case FairyPartType.Skirt: return this.skirtPart;
            case FairyPartType.Boots: return this.bootsPart;
            case FairyPartType.Wings: return this.wingsPart;
        }
    }

    public setPart(type: FairyPartType, part: FairyPart) {
        switch (type) {
            case FairyPartType.BodyBase:
                this.bodyBase = part;
                break;
            case FairyPartType.Hair:
                this.hairPart = part;
                break;
            case FairyPartType.Eyes:
                this.eyesPart = part;
                break;
            case FairyPartType.Nose:
                this.nosePart = part;
                break;
            case FairyPartType.Lips:
                this.lipsPart = part;
                break;
            case FairyPartType.Shirt:
                this.shirtPart = part;
                break;
            case FairyPartType.Gloves:
                this.glovesPart = part;
                break;
            case FairyPartType.Skirt:
                this.skirtPart = part;
                break;
            case FairyPartType.Boots:
                this.bootsPart = part;
                break;
            case FairyPartType.Wings:
                this.wingsPart = part;
                break;
        }
    }

    public static from(data: ModelWrapper<typeof FairyData.schema>) {
        if (data.isNull()) return;
        const fairy = new Fairy();

        fairy.name = data.document.name;

        fairy.userId = data.document.userId;

        fairy.level = data.document.level;
        fairy.xp = data.document.xp;

        const bodyParts = [
            { part: "bodyBase", id: data.document.bodyBaseId, type: FairyPartType.BodyBase },
            { part: "eyesPart", id: data.document.eyesId, type: FairyPartType.Eyes },
            { part: "lipsPart", id: data.document.lipsId, type: FairyPartType.Lips },
            { part: "nosePart", id: data.document.noseId, type: FairyPartType.Nose },
            { part: "hairPart", id: data.document.hairId, type: FairyPartType.Hair },
            { part: "shirtPart", id: data.document.shirtId, type: FairyPartType.Shirt },
            { part: "glovesPart", id: data.document.glovesId, type: FairyPartType.Gloves },
            { part: "skirtPart", id: data.document.skirtId, type: FairyPartType.Skirt },
            { part: "bootsPart", id: data.document.bootsId, type: FairyPartType.Boots },
            { part: "wingsPart", id: data.document.wingsId, type: FairyPartType.Wings },
        ];

        bodyParts.forEach(bodyPart => {
            fairy[bodyPart.part] = FairyPart.getById(bodyPart.id) ?? FairyPart.getByType(bodyPart.type)[0];
        });

        return fairy;
    }

    public static to(fairy: Fairy) {
        const data = new FairyData({ userId: fairy.userId });

        data.name = fairy.name;
        data.level = fairy.level;
        data.xp = fairy.xp;

        data.bodyBaseId = fairy.bodyBase.id;
        data.eyesId = fairy.eyesPart.id;
        data.lipsId = fairy.lipsPart.id;
        data.noseId = fairy.nosePart.id;
        data.hairId = fairy.hairPart.id;
        data.shirtId = fairy.shirtPart.id;
        data.glovesId = fairy.glovesPart.id;
        data.skirtId = fairy.skirtPart.id;
        data.bootsId = fairy.bootsPart.id;
        data.wingsId = fairy.wingsPart.id;

        return data;
    }
}