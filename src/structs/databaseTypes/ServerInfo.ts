export class ServerInfo{
    public maxMessagePerMinute : number;
    public maxXpPerMessage : number;
    public minMessageLength : number;
    public maxMessageLength : number;
    public levelChannel : string="";
    public excludeChannels : string[];

    public constructor(maxMessagePerMinute : number, maxXpPerMessage : number, minMessageLength : number, maxMessageLength : number){
        this.maxMessagePerMinute=maxMessagePerMinute;
        this.maxXpPerMessage=maxXpPerMessage;
        this.minMessageLength=minMessageLength;
        this.maxMessageLength=maxMessageLength;
        this.levelChannel="";
    }
}

export const DEFAULT_SERVER_INFO=new ServerInfo(50, 5, 3, 20);