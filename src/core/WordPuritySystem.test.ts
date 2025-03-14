import { WordPuritySystem } from "../core/WordPuritySystem";
import { WordPurityService } from "@externals/word-purity";
import { TestBookInfo } from "../__test__/TestingData"; 

describe("WordPuritySystem Unit Tests with Full Coverage", () => {
    let wordPurityService: jest.Mocked<WordPurityService>;
    let wordPuritySystem: WordPuritySystem;

    beforeEach(() => {
        wordPurityService = {
            words: [],
            addWord: jest.fn((words: string[]) => {
                wordPurityService.words.push(...words);
            }),
            purity: jest.fn((text: string) =>
                text.replace(/Wonderland/gi, "***") // 模擬 `Wonderland` 被過濾
            ),
        } as jest.Mocked<WordPurityService>;

        wordPuritySystem = new WordPuritySystem(wordPurityService);
    });

    test("should filter sensitive words in book titles", async () => {
        await wordPuritySystem.process(TestBookInfo);

        expect(wordPuritySystem.getItems()).toEqual([
            { ISBN: "776-33-13328-46-3", title: "The Lord of The Rings", author: "Doris Lessing" },
            { ISBN: "255-03-71788-05-4", title: "Game of Thrones I", author: "Ray Bradbury" },
            { ISBN: "712-03-87188-05-4", title: "Bone of fire", author: "Willain Bradbury" },
            { ISBN: "774-13-13326-60-1", title: "To Kill a Mockingbird", author: "Danielle Steel" },
            { ISBN: "746-25-05830-50-7", title: "One Thousand and One Nights", author: "Ernest Hemingway" },
            { ISBN: "572-70-62221-82-2", title: "Emma Story", author: "Henry James" },
            { ISBN: "680-71-48243-17-0", title: "Alice Adventures in ***", author: "Stephenie Meyer" }, // 被過濾
            { ISBN: "148-71-77362-42-3", title: "Game of Thrones II", author: "J. R. R. Tolkien" },
        ]);
    });

    test("should process correctly when disable is not set (default case)", async () => {
        await wordPuritySystem.process(TestBookInfo);
        expect(wordPuritySystem.getItems()[6].title).toBe("Alice Adventures in ***");
    });

    test("should not modify book titles if disable flag is set to true", async () => {
        wordPuritySystem.setDisablePurity(true);
        await wordPuritySystem.process(TestBookInfo);
        expect(wordPuritySystem.getItems()).toEqual(TestBookInfo);
    });

    test("should still process items when disable is explicitly set to false", async () => {
        wordPuritySystem.setDisablePurity(false);
        await wordPuritySystem.process(TestBookInfo);
        expect(wordPuritySystem.getItems()[6].title).toBe("Alice Adventures in ***");
    });

    test("should correctly add sensitive words on initialization", () => {
        expect(wordPurityService.addWord).toHaveBeenCalledWith(["Copperfield", "Wonderland"]);
        expect(wordPurityService.addWord).toHaveBeenCalledTimes(1);
    });

    test("should call WordPurityService.purity for each book title", async () => {
        await wordPuritySystem.process(TestBookInfo);
        expect(wordPurityService.purity).toHaveBeenCalledTimes(8); // 8 本書
    });

    test("should correctly initialize with default disabled state as undefined", () => {
        expect(wordPuritySystem.isDisablePurity()).toBe(undefined);
    });

    test("should store added words in WordPurityService", () => {
        wordPurityService.addWord(["testword"]);
        expect(wordPurityService.words).toContain("testword");
    });

    test("should use purityItems() correctly", () => {
        const filteredItems = (wordPuritySystem as any).purityItems(TestBookInfo);
        expect(filteredItems[6].title).toBe("Alice Adventures in ***");
    });
});
