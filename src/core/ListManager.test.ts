import { ListViewerManager, UpdateType } from "./ListManager";
import { DataBaseSystem } from "./DataBaseSystem";
import { WordPuritySystem } from "./WordPuritySystem";
import { FilterSystem } from "./FilterSystem";
import { SortSystem } from "./SortSystem";
import { DisplayRangeSystem } from "./DisplayRangeSystem";
import { WordPurityService } from "@externals/word-purity";
import { BookInfo } from "@externals/simple-db";

// 模擬 DataBaseSystem
jest.mock("./DataBaseSystem", () => {
  return {
    DataBaseSystem: jest.fn().mockImplementation(() => ({
      connectDB: jest.fn().mockResolvedValue(undefined),
      process: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockReturnValue([]),
      getUpdateMessage: jest.fn().mockReturnValue("Data Updated"),
    })),
  };
});

// 模擬 WordPuritySystem
jest.mock("./WordPuritySystem", () => {
  return {
    WordPuritySystem: jest.fn().mockImplementation(() => ({
      process: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockReturnValue([]),
      getUpdateMessage: jest.fn().mockReturnValue("WordPurity Updated"),
    })),
  };
});

// 模擬 FilterSystem
jest.mock("./FilterSystem", () => {
  return {
    FilterSystem: jest.fn().mockImplementation(() => ({
      process: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockReturnValue([]),
      getUpdateMessage: jest.fn().mockReturnValue("Filter Updated"),
    })),
  };
});

// 模擬 SortSystem
jest.mock("./SortSystem", () => {
  return {
    SortSystem: jest.fn().mockImplementation(() => ({
      process: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockReturnValue([]),
      getUpdateMessage: jest.fn().mockReturnValue("Sort Updated"),
    })),
  };
});

// 模擬 DisplayRangeSystem
jest.mock("./DisplayRangeSystem", () => {
  return {
    DisplayRangeSystem: jest.fn().mockImplementation(() => ({
      process: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockReturnValue([
        { ISBN: "12345", title: "Book A", author: "Author A" },
        { ISBN: "67890", title: "Book B", author: "Author B" }
      ]),
      getUpdateMessage: jest.fn().mockReturnValue("Display Updated"),
    })),
  };
});

// 模擬 WordPurityService（用於 WordPuritySystem 建構式中）
jest.mock("@externals/word-purity", () => {
  return {
    WordPurityService: jest.fn().mockImplementation(() => ({
      addWord: jest.fn(),
      purity: jest.fn((text: string) => text.replace(/Copperfield|Wonderland/g, "***")),
    })),
  };
});

describe("ListViewerManager - Full Coverage", () => {
  let manager: ListViewerManager;
  let dbInstance: any;
  let wpInstance: any;
  let filterInstance: any;
  let sortInstance: any;
  let displayInstance: any;

  beforeEach(async () => {
    // 建立 ListViewerManager，setUp() 內部會 new 各個系統（皆為 Jest mock）
    manager = new ListViewerManager();
    await manager.setUp();

    // 直接從 manager 的 processors 陣列取得各系統實例
    dbInstance = manager["processors"][0];
    wpInstance = manager["processors"][1];
    filterInstance = manager["processors"][2];
    sortInstance = manager["processors"][3];
    displayInstance = manager["processors"][4];
  });

  test("should initialize all systems in correct order", async () => {
    // 檢查 DataBaseSystem.connectDB 是否被呼叫
    expect(dbInstance.connectDB).toHaveBeenCalled();
    // 驗證 processors 陣列的順序是否正確
    expect(manager["processors"]).toEqual([
      dbInstance,
      wpInstance,
      filterInstance,
      sortInstance,
      displayInstance,
    ]);
  });

  test("should update correct systems starting from the given updateType", async () => {
    // UpdateType.Filter 對應數值 2，所以將從 processors[2] (FilterSystem) 開始更新
    await manager.updateResult(UpdateType.Filter);

    expect(filterInstance.process).toHaveBeenCalled();
    expect(sortInstance.process).toHaveBeenCalled();
    expect(displayInstance.process).toHaveBeenCalled();

    expect(manager.getUpdateMessage()).toEqual([
      "Filter Updated",
      "Sort Updated",
      "Display Updated",
    ]);
  });

  test("should update from Data updateType and process all systems", async () => {
    // UpdateType.Data 為 0，所以會從 processors[0] 至 processors[4] 全部更新
    await manager.updateResult(UpdateType.Data);

    expect(dbInstance.process).toHaveBeenCalled();
    expect(wpInstance.process).toHaveBeenCalled();
    expect(filterInstance.process).toHaveBeenCalled();
    expect(sortInstance.process).toHaveBeenCalled();
    expect(displayInstance.process).toHaveBeenCalled();
  });

  test("should return correct processor when using getProcessor()", () => {
    // 根據設計：processors[2] 為 FilterSystem, processors[3] 為 SortSystem
    expect(manager.getProcessor(UpdateType.Filter)).toBe(filterInstance);
    expect(manager.getProcessor(UpdateType.Sort)).toBe(sortInstance);
  });

  test("should return correct formatted book info for display", () => {
    const displayItems = manager.generateDisplayItemRow();
    expect(displayItems).toEqual([
      { ISBN: "12345", title: "Book A", author: "Author A" },
      { ISBN: "67890", title: "Book B", author: "Author B" },
    ]);
  });
});
