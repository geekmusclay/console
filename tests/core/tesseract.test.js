const { default: Tesseract } = require('../../lib/core/tesseract.js');

describe("Tesseract", () => {
    let tesseract;

    beforeEach(() => {
        tesseract = new Tesseract();
    });

    describe("hook", () => {
        it("should add a hook to the hooks object", () => {
            const key = "beforeAll";
            const callback = jest.fn();

            tesseract.hook(key, callback);

            expect(tesseract.hooks).toEqual({
                [key]: callback,
            });
        });

        it("should throw an error if the hooks object is null", () => {
            const key = "beforeAll";
            const callback = jest.fn();

            tesseract.hooks = null;

            expect(() => {
                tesseract.hook(key, callback);
            }).toThrowError("Tesseract hooks object is null.");
        });
    });

    describe("load", () => {
        it("should throw an error if the root is null", () => {
            tesseract.root = null;

            expect(() => {
                tesseract.load();
            }).toThrowError("Tesseract root not set.");
        });

        it("should throw an error if the root file does not exist", () => {
            tesseract.root = "./tesseract.json";

            expect(() => {
                tesseract.load();
            }).toThrowError("This project does not use tesseract.");
        });

        it("should throw an error if no arguments are provided", () => {
            tesseract.root = "./tesseract.json";
            tesseract.config = {
                commands: {},
            };

            expect(() => {
                tesseract.load();
            }).toThrowError("No arguments provided.");
        });

        it("should throw an error if the command does not exist in the config", () => {
            tesseract.root = "./tesseract.json";
            tesseract.config = {
                commands: {},
            };
            tesseract.command = "page";

            expect(() => {
                tesseract.load();
            }).toThrowError("Command page does not exist.");
        });

        // Add more tests as needed
    });

    // Add more tests for other methods as needed
});