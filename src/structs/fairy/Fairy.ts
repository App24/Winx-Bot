import { BotUser } from "../../BotClient";
import { getServerDatabase } from "../../utils/Utils";
import { DatabaseType } from "../DatabaseTypes";
import { UserFairyData } from "../databaseTypes/UserFairy";
import { FairyData } from "./FairyData";
import { BODY_BASE_PARTS, BOOTS_PARTS, FairyPart, HAIR_PARTS, LOWER_BODY_PARTS, UPPER_BODY_PARTS, WINGS_PARTS } from "./FairyPart";

export class Fairy {
    public name: string;
    public bodyBase: FairyPart;
    public hairPart: FairyPart;
    public upperBodyPart: FairyPart;
    public wingsPart: FairyPart;
    public lowerBodyPart: FairyPart;
    public bootsPart: FairyPart;

    public constructor() {
        this.bodyBase = BODY_BASE_PARTS[0];
        this.hairPart = HAIR_PARTS[0];
        this.upperBodyPart = UPPER_BODY_PARTS[0];
        this.wingsPart = WINGS_PARTS[0];
        this.lowerBodyPart = LOWER_BODY_PARTS[0];
        this.bootsPart = BOOTS_PARTS[0];
    }

    public static from(data: FairyData) {
        const fairy = new Fairy();

        fairy.name = data.name;

        const bodyParts = [
            { part: "bodyBase", file: data.bodyBaseFile },
            { part: "hairPart", file: data.hairPartFile },
            { part: "upperBodyPart", file: data.upperBodyPartFile },
            { part: "wingsPart", file: data.wingsPartFile },
            { part: "lowerBodyPart", file: data.upperBodyPartFile },
            { part: "bootsPart", file: data.bootsPartFile },
        ];

        bodyParts.forEach(bodyPart => {
            fairy[bodyPart.part] = FairyPart.from(bodyPart.file);
        });

        return fairy;
    }

    public static async getServerFairies(guildId: string) {
        const Fairies = BotUser.getDatabase(DatabaseType.Fairies);
        const fairiesData: UserFairyData[] = await getServerDatabase(Fairies, guildId);

        const fairies: UserFairy[] = [];

        fairiesData.forEach(data => {
            fairies.push({ userId: data.userId, fairy: Fairy.from(data.fairy) });
        });

        return fairies;
    }

    public static async saveServerFairies(guildId: string, fairies: UserFairy[]) {
        const Fairies = BotUser.getDatabase(DatabaseType.Fairies);

        const fairiesData: UserFairyData[] = fairies.map(fairy => {
            return { userId: fairy.userId, fairy: fairy.fairy.data() };
        });

        Fairies.set(guildId, fairiesData);
    }

    public data() {
        const fairyData: FairyData = {
            name: this.name,
            bodyBaseFile: this.bodyBase.dataFile,
            hairPartFile: this.hairPart.dataFile,
            upperBodyPartFile: this.upperBodyPart.dataFile,
            wingsPartFile: this.wingsPart.dataFile,
            lowerBodyPartFile: this.lowerBodyPart.dataFile,
            bootsPartFile: this.bootsPart.dataFile,
        };

        return fairyData;
    }
}

export interface UserFairy {
    userId: string;
    fairy: Fairy;
}