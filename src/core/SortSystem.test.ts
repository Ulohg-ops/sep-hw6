import { SortSystem } from "../core/SortSystem";
import { BookInfo } from "@externals/simple-db";
import { TestBookInfo } from "../__test__/TestingData"; 

describe("SortSystem Unit Tests", () => {
    let sortSystem: SortSystem;

    beforeEach(() => {
        sortSystem = new SortSystem();
    });

    test("sorts books by title in ascending order (A-Z)", async () => {
        sortSystem.setSortType(SortSystem.ASC);
        await sortSystem.process(TestBookInfo);
        expect(sortSystem.getItems().map((book: BookInfo) => book.title)).toEqual([
            "Alice Adventures in Wonderland",
            "Bone of fire",
            "Emma Story",
            "Game of Thrones I",
            "Game of Thrones II",
            "One Thousand and One Nights",
            "The Lord of The Rings",
            "To Kill a Mockingbird"
        ]);
    });

    test("sorts books by title in descending order (Z-A)", async () => {
        sortSystem.setSortType(SortSystem.DESC);
        await sortSystem.process(TestBookInfo);
        expect(sortSystem.getItems().map((book: BookInfo) => book.title)).toEqual([
            "To Kill a Mockingbird",
            "The Lord of The Rings",
            "One Thousand and One Nights",
            "Game of Thrones II",
            "Game of Thrones I",
            "Emma Story",
            "Bone of fire",
            "Alice Adventures in Wonderland"
        ]);
    });

    test("throws an error when an invalid sort type is set", () => {
        expect(() => sortSystem.setSortType("INVALID")).toThrow("It must be ASC or DESC");
    });

    test("handles an empty book list without errors", async () => {
        sortSystem.setSortType(SortSystem.ASC);
        await sortSystem.process([]);
        expect(sortSystem.getItems().length).toBe(0);
    });

    test("allows setting and retrieving the sort type", () => {
        sortSystem.setSortType(SortSystem.DESC);
        expect(sortSystem.getSortType()).toBe("DESC");
    });
});
