export default interface CommandConfigInterface {
    [key: string]: {
        params: string[];
        dir: string[];
        files: {
            from: string;
            to: string;
        }[];
    };
}
