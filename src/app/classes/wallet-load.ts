/* eslint-disable */

export class WalletLoad {

    public name: string;
    public password: string;
    public folderPath?: string;

    constructor(name: string, password: string, folderPath: string = null) {
        this.name = name;
        this.password = password;
        this.folderPath = folderPath;
    }
}
