import { BaseSystem } from "../core/BaseSystem";
import { BookInfo } from "@externals/simple-db";

// 建立一個 TestBaseSystem，用來實作 BaseSystem 的抽象方法 process
class TestBaseSystem extends BaseSystem {
    public process(prevItems: BookInfo[]): void {
        // 這裡簡單將傳入的陣列存入 items
        this.items = prevItems;
    }
}

describe("BaseSystem Tests", () => {
    let testSystem: TestBaseSystem;
    const dummyUpdateMessage = "Test Update";
    const dummyBooks: BookInfo[] = [
        { ISBN: "123", title: "Book One", author: "Author A" },
        { ISBN: "456", title: "Book Two", author: "Author B" },
    ];

    beforeEach(() => {
        testSystem = new TestBaseSystem(dummyUpdateMessage);
    });

    test("should initialize update message correctly", () => {
        expect(testSystem.getUpdateMessage()).toEqual(dummyUpdateMessage);
    });

    test("should have empty items initially", () => {
        expect(testSystem.getItems()).toEqual([]);
    });

    test("should update items when process() is called", () => {
        testSystem.process(dummyBooks);
        expect(testSystem.getItems()).toEqual(dummyBooks);
    });
});
