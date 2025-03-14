import { DisplayRangeSystem } from "../core/DisplayRangeSystem";
import { BookInfo } from "@externals/simple-db";
import { TestBookInfo } from "../__test__/TestingData"; // Importing system-provided test data

describe("DisplayRangeSystem Unit Tests", () => {
    let displayRangeSystem: DisplayRangeSystem;

    beforeEach(() => {
        displayRangeSystem = new DisplayRangeSystem();
    });

    test("sets valid range and retrieves correct values", () => {
        displayRangeSystem.setRange(2, 5);
        expect(displayRangeSystem.getStartRange()).toBe(2);
        expect(displayRangeSystem.getEndRange()).toBe(5);
    });

    test("accepts string inputs and converts them correctly", () => {
        displayRangeSystem.setRange("3", "6");
        expect(displayRangeSystem.getStartRange()).toBe(3);
        expect(displayRangeSystem.getEndRange()).toBe(6);
    });

    test("throws an error when startRange is negative", () => {
        expect(() => displayRangeSystem.setRange(-1, 5)).toThrow("Cannot be less than 0");
    });

    test("throws an error when startRange is zero", () => {
        expect(() => displayRangeSystem.setRange(0, 5)).toThrow("Cannot be less than 0");
    });

    test("throws an error when endRange is smaller than startRange", () => {
        expect(() => displayRangeSystem.setRange(5, 2)).toThrow("End Range cannot less than Start Range");
    });

    test("throws an error when startRange is a float", () => {
        expect(() => displayRangeSystem.setRange(1.5, 5)).toThrow("Invalid Float Input");
    });

    test("throws an error when endRange is a float", () => {
        expect(() => displayRangeSystem.setRange(1, 5.7)).toThrow("Invalid Float Input");
    });

    test("throws an error when startRange is an invalid string", () => {
        expect(() => displayRangeSystem.setRange("abc", 5)).toThrow("Invalid String Input");
    });

    test("throws an error when endRange is an invalid string", () => {
        expect(() => displayRangeSystem.setRange(1, "xyz")).toThrow("Invalid String Input");
    });

    test("correctly slices items based on range", async () => {
        displayRangeSystem.setRange(2, 4);
        await displayRangeSystem.process(TestBookInfo);
        expect(displayRangeSystem.getItems().map((book: BookInfo) => book.title)).toEqual([
            "Game of Thrones I",
            "Bone of fire",
            "To Kill a Mockingbird"
        ]);
    });

    test("returns an empty list when range exceeds available items", async () => {
        displayRangeSystem.setRange(20, 30);
        await displayRangeSystem.process(TestBookInfo);
        expect(displayRangeSystem.getItems().length).toBe(0);
    });

    test("returns all available items when range is within the dataset", async () => {
        displayRangeSystem.setRange(1, 8);
        await displayRangeSystem.process(TestBookInfo);
        expect(displayRangeSystem.getItems().length).toBe(8);
    });
});
