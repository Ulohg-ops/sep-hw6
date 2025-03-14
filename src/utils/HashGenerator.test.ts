import { HashGenerator } from "./HashGenerator";

describe("HashGenerator Unit Tests", () => {
    let hashGenerator: HashGenerator;

    beforeEach(() => {
        hashGenerator = new HashGenerator();
        jest.spyOn(global.Math, 'random'); 
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });


    //partial oracle
    test("should generate a string with the correct length", () => {
        const result = hashGenerator.g(5);
        expect(result).toHaveLength(5);  // 只檢查長度，沒檢查內容
    });

    //partial oracle
    test("should generate uppercase letters", () => {
        const result = hashGenerator.g(5);
        expect(result).toMatch(/^[A-Z]{5}$/);  // 只檢查是否為大寫字母，不檢查具體值
    });

    //partial oracle
    test("should generate letters with uniform distribution", () => {
        const numSamples = 100000; // 產生 100,000 個隨機字母
        const letterCounts: Record<string, number> = {};

        for (let i = 0; i < numSamples; i++) {
            const letter = hashGenerator.g(1); // 產生 1 個字母
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }

        // 計算每個字母的出現頻率
        const frequencies = Object.values(letterCounts);
        const meanFrequency = numSamples / 26; // 理論上每個字母應該出現 numSamples/26 次

        // 檢查所有字母的出現次數是否均勻
        frequencies.forEach(count => {
            expect(count).toBeGreaterThan(meanFrequency * 0.9); // 不應該少於理論值的 90%
            expect(count).toBeLessThan(meanFrequency * 1.1); // 也不應該超過 110%
        });
    });


    test("should generate a string of random uppercase letters (A-Z)", () => {
        jest.spyOn(global.Math, 'random')
            .mockReturnValueOnce(0.0)  // 'A'
            .mockReturnValueOnce(0.5)  // 'N'
            .mockReturnValueOnce(0.999); // 'Z'

        const result = hashGenerator.g(3);
        expect(result).toBe("ANZ");
    });

    test("should throw an error when g() is called with 0 or negative number", () => {
        expect(() => hashGenerator.g(0)).toThrow("Hash number can't less than 0");
        expect(() => hashGenerator.g(-1)).toThrow("Hash number can't less than 0");
    });

    test("should generate ISBN-like numbers where non '-' characters are converted to digits", () => {
        jest.spyOn(global.Math, 'random')
            .mockReturnValueOnce(0.1).mockReturnValueOnce(0.2)  // "12"
            .mockReturnValueOnce(0.3).mockReturnValueOnce(0.4)  // "34"
            .mockReturnValueOnce(0.5).mockReturnValueOnce(0.6); // "56"

        const pattern = "AB-CD-EF";
        const result = hashGenerator.simpleISBN(pattern);

        expect(result).toBe("12-34-56"); 
    });

    
    
});
