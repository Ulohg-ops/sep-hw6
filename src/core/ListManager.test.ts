import { DataBaseSystem } from "../core/DataBaseSystem";
import { BookDataBaseService, BookInfo } from "@externals/simple-db";
import { HashGenerator } from "../utils/HashGenerator";
import { TestBookInfo } from "../__test__/TestingData"; // 測試用 Book 資料

jest.setTimeout(10000);

describe("DataBaseSystem Full Coverage Tests", () => {
  let mockDB: jest.Mocked<BookDataBaseService>;
  let mockHashGenerator: jest.Mocked<HashGenerator>;
  let databaseSystem: DataBaseSystem;

  beforeEach(() => {
    mockDB = {
      setUp: jest.fn(),
      getBooks: jest.fn(),
      addBook: jest.fn(),
      deleteBook: jest.fn(),
    } as unknown as jest.Mocked<BookDataBaseService>;

    mockHashGenerator = {
      simpleISBN: jest.fn().mockReturnValue("123-45-67890-12-3"),
    } as unknown as jest.Mocked<HashGenerator>;

    databaseSystem = new DataBaseSystem(mockDB, mockHashGenerator);

    jest.spyOn(databaseSystem as any, "retryDelay");
  });

  test("should connect to database and fetch books successfully", async () => {
    mockDB.setUp.mockResolvedValue("Connected");
    mockDB.getBooks.mockResolvedValue(TestBookInfo);

    await expect(databaseSystem.connectDB()).resolves.toBe("Connected");

    expect(mockDB.setUp).toHaveBeenCalledWith("http://localhost", 4000);
    expect(mockDB.getBooks).toHaveBeenCalledTimes(1);
    expect(databaseSystem.getItems()).toEqual(TestBookInfo);
  });

  test("should retry 5 times and throw error if connection fails", async () => {
    mockDB.setUp.mockRejectedValue(new Error("Connection failed"));

    await expect(databaseSystem.connectDB()).rejects.toThrow("Cannnot connect to DB");

    expect(mockDB.setUp).toHaveBeenCalledTimes(5);
    expect((databaseSystem as any).retryDelay).toHaveBeenCalledTimes(5);
  });

  test("should add book successfully when title and author are provided", async () => {
    await databaseSystem.addBook("Test Title", "Test Author");

    expect(mockHashGenerator.simpleISBN).toHaveBeenCalledWith("000-00-00000-00-0");
    expect(mockDB.addBook).toHaveBeenCalledWith({
      ISBN: "123-45-67890-12-3",
      title: "Test Title",
      author: "Test Author",
    });
  });

  test("should throw error if title or author is missing", async () => {
    await expect(databaseSystem.addBook("", "Test Author")).rejects.toThrow("Add book failed");
    await expect(databaseSystem.addBook("Test Title", "")).rejects.toThrow("Add book failed");
    expect(mockDB.addBook).not.toHaveBeenCalled();
  });

  test("should throw error if addBook fails in database", async () => {
    mockDB.addBook.mockRejectedValue(new Error("DB error"));
    await expect(databaseSystem.addBook("Test Title", "Test Author")).rejects.toThrow("Add book failed");
  });

  test("should delete book when valid ISBN is provided", async () => {
    await databaseSystem.deleteBook("123-45-67890-12-3");

    expect(mockDB.deleteBook).toHaveBeenCalledWith("123-45-67890-12-3");
  });

  test("should throw error if ISBN is missing", async () => {
    await expect(databaseSystem.deleteBook("")).rejects.toThrow("Delete book failed");
    expect(mockDB.deleteBook).not.toHaveBeenCalled();
  });

  test("should throw error if deleteBook fails in database", async () => {
    mockDB.deleteBook.mockRejectedValue(new Error("DB error"));
    await expect(databaseSystem.deleteBook("123-45-67890-12-3")).rejects.toThrow("Delete book failed");
  });

  test("should update items when process() is called", async () => {
    mockDB.getBooks.mockResolvedValue(TestBookInfo);

    await databaseSystem.process([]);

    expect(mockDB.getBooks).toHaveBeenCalledTimes(1);
    expect(databaseSystem.getItems()).toEqual(TestBookInfo);
  });

  test("should not throw error if getBooks fails in process()", async () => {
    mockDB.getBooks.mockRejectedValue(new Error("DB error"));

    await expect(databaseSystem.process([])).resolves.not.toThrow();
    expect(mockDB.getBooks).toHaveBeenCalledTimes(1);
  });
});
