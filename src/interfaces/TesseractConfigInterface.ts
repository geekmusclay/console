import CommandConfigInterface from "./CommandConfigInterface";

export default interface TesseractConfigInterface {
    src: string;
    commands: CommandConfigInterface;
}
