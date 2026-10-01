import { describe, expect, it } from "vitest";
import {
  composeCoordKey,
  getProblemExtraLinks,
  normalizeCoordTitle,
  normalizeTitleKey,
  parseExtraLinksFile,
} from "@/data/problem-extra-links";

describe("problem extra links", () => {
  it("looks up YouTube by sheet coordinate", () => {
    const links = getProblemExtraLinks(1, 1, "User Input / Output");
    expect(links.youtubeLink).toMatch(/^https:\/\/youtu\.be\//);
  });

  it("looks up article URLs by title", () => {
    const links = getProblemExtraLinks(1, 4, "Count Digits");
    expect(links.articleLink).toMatch(/^https:\/\/takeuforward\.org\//);
  });

  it("resolves TUF blogs onto sheet titles that differ from the live sheet wording", () => {
    const matrix = getProblemExtraLinks(3, 2, "Set Matrix Zeros");
    expect(matrix.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/set-matrix-zeroes",
    );
    const hashing = getProblemExtraLinks(1, 6, "Hashing Theory");
    expect(hashing.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/hashing-data-structures",
    );
  });

  it("fills leftover sheet titles from TUF sitemap slugs", () => {
    const morris = getProblemExtraLinks(13, 3, "Morris Preorder Traversal of a Binary Tree");
    expect(morris.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/morris-preorder-traversal",
    );
    const merge = getProblemExtraLinks(3, 3, "Merge Overlapping Subintervals");
    expect(merge.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-overlapping-intervals",
    );
    const kruskal = getProblemExtraLinks(15, 5, "Kruskal's Algorithm");
    expect(kruskal.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/kruskals-algorithm-minimum-spanning-tree",
    );
    const floorCeil = getProblemExtraLinks(4, 1, "Floor/Ceil in Sorted Array");
    expect(floorCeil.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/find-ceil-in-a-sorted-array",
    );
  });

  it("resolves articles for newly added TUF rows", () => {
    const fundamentals = getProblemExtraLinks(1, 7, "Breaking The Myth");
    expect(fundamentals.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/breaking-the-myth-dsa-is-language-independent",
    );
    const pascal = getProblemExtraLinks(3, 3, "Pascal's Triangle II");
    expect(pascal.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/pascal-triangle-ii",
    );
    const merge = getProblemExtraLinks(6, 5, "Merge two Sorted Lists");
    expect(merge.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/merge-two-sorted-linked-lists",
    );
    const heapsTheory = getProblemExtraLinks(11, 1, "Heaps (Theory Video)");
    expect(heapsTheory.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/introduction-to-heap",
    );
    const sortedI = getProblemExtraLinks(1, 8, "Check if the Array is Sorted I");
    expect(sortedI.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/check-if-an-array-is-sorted-in-ascending-order",
    );
  });

  it("resolves TUF practice URLs onto matched sheet titles", () => {
    const infix = getProblemExtraLinks(9, 2, "Infix to Postfix Conversion using Stack");
    expect(infix.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/infix-to-postfix-conversion",
    );
    const heapsTheory = getProblemExtraLinks(11, 1, "Heaps (Theory Video)");
    expect(heapsTheory.tufLink).toBe("https://takeuforward.org/practice/dsa/heaps-theory");
    const myth = getProblemExtraLinks(1, 7, "Breaking The Myth");
    expect(myth.tufLink).toBe("https://takeuforward.org/practice/dsa/breaking-the-myth");
    const digits = getProblemExtraLinks(1, 4, "Count Digits");
    expect(digits.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/count-all-digits-of-a-number",
    );
    const trieOps = getProblemExtraLinks(17, 1, "Implement TRIE | INSERT | SEARCH | STARTSWITH");
    expect(trieOps.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/trie-implementation-and-operations",
    );
    const trie2 = getProblemExtraLinks(17, 1, "Implement Trie - 2 (Prefix Tree)");
    expect(trie2.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/trie-ii-count-words-erase",
    );
    expect(trie2.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/trie-implementation-and-advanced-operations",
    );
    const reverseEveryWord = getProblemExtraLinks(18, 1, "Reverse every word in a string");
    expect(reverseEveryWord.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/reverse-every-word-in-a-string",
    );
    expect(reverseEveryWord.articleLink).toBe(
      "https://takeuforward.org/blogs/data-structure-and-algorithm/reverse-every-word-in-a-string",
    );
    const learnCpp = getProblemExtraLinks(1, 1, "Learn C++");
    expect(learnCpp.tufLink).toBe("https://takeuforward.org/learning/dsa/learn-cpp");
    const rootToLeaf = getProblemExtraLinks(13, 3, "Print root to leaf path in BT");
    expect(rootToLeaf.tufLink).toBe(
      "https://takeuforward.org/practice/dsa/print-root-to-leaf-path-in-bt",
    );
  });

  it("normalizes coord and title keys", () => {
    expect(normalizeCoordTitle("  User   Input / Output ")).toBe("user input / output");
    expect(normalizeTitleKey("Count Digits!")).toBe("count digits");
    expect(composeCoordKey(1, 1, "user input / output")).toBe("1|1|user input / output");
  });

  it("rejects extra-links payloads that drift from the expected shape", () => {
    expect(() => parseExtraLinksFile({ byCoord: {}, extra: true })).toThrow();
    expect(parseExtraLinksFile({ byCoord: {}, byTitle: {} })).toEqual({ byCoord: {}, byTitle: {} });
  });
});
