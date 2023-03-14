export class ServerData {
    public dataName: string;
    public serverName: string;
    public channelData: ServerChannelData[];
}

export class ServerChannelData {
    public id: string;
    public name: string;
}