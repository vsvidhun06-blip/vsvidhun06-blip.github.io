// Cached snapshot of the public LeetCode profile. LeetCode has no stable public
// API, so the site does not fetch live data. To refresh: query
// https://leetcode.com/graphql for matchedUser(username: "VidhuViny") and update
// the numbers and `snapshotDate` below.

export const leetcode = {
  username: "VidhuViny",
  url: "https://leetcode.com/u/VidhuViny/",
  snapshotDate: "18 November 2026",
  solved: { total: 153, easy: 33, medium: 93, hard: 27 },
  available: { easy: 976, medium: 2148, hard: 991 },
  language: "Java",
  topics: [
    { name: "Array", solved: 68 },
    { name: "String", solved: 37 },
    { name: "Dynamic Programming", solved: 33 },
    { name: "Tree", solved: 26 },
    { name: "Hash Table", solved: 23 },
    { name: "Two Pointers", solved: 23 },
    { name: "Linked List", solved: 22 },
    { name: "Depth-First Search", solved: 20 },
    { name: "Backtracking", solved: 19 },
    { name: "Math", solved: 19 },
    { name: "Breadth-First Search", solved: 13 },
    { name: "Stack", solved: 13 },
  ],
} as const;
