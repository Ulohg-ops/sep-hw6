import { FilterSystem } from "../core/FilterSystem";
import { BookInfo } from "@externals/simple-db";
import { TestBookInfo } from "../__test__/TestingData";

describe("FilterSystem Unit Tests", () => {
    let filterSystem: FilterSystem;

    beforeEach(() => {
        filterSystem = new FilterSystem();
    });

    test("Should correctly filter books based on a keyword", async () => {
        filterSystem.setFilterWord("Game");
        await filterSystem.process(TestBookInfo);
        expect(filterSystem.getItems().length).toBe(2);
        expect(filterSystem.getItems().map((book: BookInfo) => book.title)).toEqual([
            "Game of Thrones I",
            "Game of Thrones II"
        ]);
    });

    test("Should filter books ignoring case sensitivity", async () => {
        filterSystem.setFilterWord("game");
        filterSystem.setIgnoreCase(true);
        await filterSystem.process(TestBookInfo);
        expect(filterSystem.getItems().length).toBe(2);
        expect(filterSystem.getItems().map((book: BookInfo) => book.title)).toEqual([
            "Game of Thrones I",
            "Game of Thrones II"
        ]);
    });

    test("Should return an empty array if no books match the keyword", async () => {
        filterSystem.setFilterWord("Harry Potter");
        await filterSystem.process(TestBookInfo);
        expect(filterSystem.getItems().length).toBe(0);
    });

    test("Should not throw an error when filtering an empty book list", async () => {
        filterSystem.setFilterWord("Game");
        await filterSystem.process([]);
        expect(filterSystem.getItems().length).toBe(0);
    });

    test("Should allow setting and retrieving the filter keyword", () => {
        filterSystem.setFilterWord("Emma");
        expect(filterSystem.getFilterWord()).toBe("Emma");
    });

    test("Should allow setting and retrieving the ignore case option", () => {
        filterSystem.setIgnoreCase(true);
        expect(filterSystem.isIgnoreCase()).toBe(true);
    });
});
