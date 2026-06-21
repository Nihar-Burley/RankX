import { writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const problemCategories = [
  { id: 1, key: "algorithms", name: "Algorithms" },
  { id: 2, key: "backend", name: "Backend Engineering" },
  { id: 3, key: "data-structures", name: "Data Structures" },
];

const problemSubcategories = [
  { id: 11, categoryId: 1, key: "arrays", name: "Arrays" },
  { id: 12, categoryId: 1, key: "strings", name: "Strings" },
  { id: 13, categoryId: 3, key: "stacks-queues", name: "Stacks and Queues" },
  { id: 14, categoryId: 1, key: "binary-search", name: "Binary Search" },
  { id: 15, categoryId: 1, key: "intervals", name: "Intervals" },
  { id: 16, categoryId: 3, key: "hashmaps", name: "Hash Maps" },
  { id: 17, categoryId: 1, key: "sliding-window", name: "Sliding Window" },
  { id: 18, categoryId: 3, key: "heaps-priority-queue", name: "Heaps and Priority Queues" },
  { id: 19, categoryId: 1, key: "graphs", name: "Graphs" },
  { id: 20, categoryId: 1, key: "dynamic-programming", name: "Dynamic Programming" },
  { id: 21, categoryId: 2, key: "design", name: "Design-Oriented Problems" },
  { id: 22, categoryId: 1, key: "matrix", name: "Matrix Traversal" },
  { id: 23, categoryId: 3, key: "linked-lists", name: "Linked Lists" },
  { id: 24, categoryId: 3, key: "trees", name: "Trees" },
  { id: 25, categoryId: 1, key: "greedy", name: "Greedy" },
  { id: 26, categoryId: 1, key: "two-pointers", name: "Two Pointers" },
  { id: 27, categoryId: 1, key: "topological-sort", name: "Topological Sort" },
];

const tags = [
  "array",
  "hash-map",
  "string",
  "dynamic-programming",
  "stack",
  "binary-search",
  "sorting",
  "intervals",
  "sliding-window",
  "heap",
  "graph",
  "matrix",
  "set",
  "prefix-suffix",
  "linked-list",
  "tree",
  "bfs",
  "dfs",
  "greedy",
  "design",
  "queue",
  "two-pointers",
  "topological-sort",
  "cache",
];

const companies = [
  "Google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Uber",
  "Netflix",
  "Atlassian",
  "Stripe",
  "Airbnb",
  "Adobe",
];

const problems = [
  {
    id: 101,
    title: "Two Sum",
    difficulty: "EASY",
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Return the indices in any order.",
    constraints:
      "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9\\n-10^9 <= target <= 10^9\\nExactly one valid answer exists.",
    editorial:
      "Store previously seen values in a hash map and look up the complement for each new number in constant time.",
    categoryId: 1,
    subcategoryId: 11,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["array", "hash-map"],
    companyNames: ["Google", "Amazon"],
    functionName: "twoSum",
    javaSignature: "public int[] twoSum(int[] nums, int target)",
    pythonSignature: "def two_sum(self, nums, target)",
    jsSignature: "function twoSum(nums, target)",
    returnJava: "return new int[0];",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[2,7,11,15]\\n9", output: "[0,1]", sample: true, score: 1 },
      { input: "[3,2,4]\\n6", output: "[1,2]", sample: true, score: 1 },
      { input: "[3,3]\\n6", output: "[0,1]", sample: false, score: 2 },
    ],
  },
  {
    id: 102,
    title: "Valid Anagram",
    difficulty: "EASY",
    statement:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    constraints:
      "1 <= s.length, t.length <= 5 * 10^4\\ns and t consist of lowercase English letters.",
    editorial:
      "Compare character frequencies with a fixed-size counter array or a map keyed by character.",
    categoryId: 3,
    subcategoryId: 16,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["string", "hash-map"],
    companyNames: ["Meta", "Microsoft"],
    functionName: "isAnagram",
    javaSignature: "public boolean isAnagram(String s, String t)",
    pythonSignature: "def is_anagram(self, s, t)",
    jsSignature: "function isAnagram(s, t)",
    returnJava: "return false;",
    returnPython: "return False",
    returnJs: "return false;",
    testCases: [
      { input: "anagram\\nnagaram", output: "true", sample: true, score: 1 },
      { input: "rat\\ncar", output: "false", sample: true, score: 1 },
      { input: "listen\\nsilent", output: "true", sample: false, score: 2 },
    ],
  },
  {
    id: 103,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "EASY",
    statement:
      "You are given an array prices where prices[i] is the price of a given stock on the i-th day. Find the maximum profit you can achieve from one transaction.",
    constraints: "1 <= prices.length <= 10^5\\n0 <= prices[i] <= 10^4",
    editorial:
      "Track the lowest price so far and update the best profit each day in one linear scan.",
    categoryId: 1,
    subcategoryId: 20,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["array", "dynamic-programming"],
    companyNames: ["Amazon", "Uber"],
    functionName: "maxProfit",
    javaSignature: "public int maxProfit(int[] prices)",
    pythonSignature: "def max_profit(self, prices)",
    jsSignature: "function maxProfit(prices)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "[7,1,5,3,6,4]", output: "5", sample: true, score: 1 },
      { input: "[7,6,4,3,1]", output: "0", sample: true, score: 1 },
      { input: "[2,4,1]", output: "2", sample: false, score: 2 },
    ],
  },
  {
    id: 104,
    title: "Valid Parentheses",
    difficulty: "EASY",
    statement:
      "Given a string s containing the characters ()[]{} determine if the input string is valid.",
    constraints:
      "1 <= s.length <= 10^4\\ns consists of parentheses characters only.",
    editorial:
      "Use a stack of opening brackets and validate every closing bracket against the latest unmatched opener.",
    categoryId: 3,
    subcategoryId: 13,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["stack", "string"],
    companyNames: ["Google", "Meta"],
    functionName: "isValid",
    javaSignature: "public boolean isValid(String s)",
    pythonSignature: "def is_valid(self, s)",
    jsSignature: "function isValid(s)",
    returnJava: "return false;",
    returnPython: "return False",
    returnJs: "return false;",
    testCases: [
      { input: "()[]{}", output: "true", sample: true, score: 1 },
      { input: "(]", output: "false", sample: true, score: 1 },
      { input: "([{}])", output: "true", sample: false, score: 2 },
    ],
  },
  {
    id: 105,
    title: "Binary Search",
    difficulty: "EASY",
    statement:
      "Given a sorted array of integers nums and a target value, return the index if the target is found. Otherwise, return -1.",
    constraints:
      "1 <= nums.length <= 10^4\\nnums is sorted in ascending order.\\nAll values are unique.",
    editorial:
      "Maintain low and high pointers, compute the middle carefully, and shrink the search range until the target is found or exhausted.",
    categoryId: 1,
    subcategoryId: 14,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["array", "binary-search"],
    companyNames: ["Microsoft", "Amazon"],
    functionName: "search",
    javaSignature: "public int search(int[] nums, int target)",
    pythonSignature: "def search(self, nums, target)",
    jsSignature: "function search(nums, target)",
    returnJava: "return -1;",
    returnPython: "return -1",
    returnJs: "return -1;",
    testCases: [
      { input: "[-1,0,3,5,9,12]\\n9", output: "4", sample: true, score: 1 },
      { input: "[-1,0,3,5,9,12]\\n2", output: "-1", sample: true, score: 1 },
      { input: "[5]\\n5", output: "0", sample: false, score: 2 },
    ],
  },
  {
    id: 106,
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    statement:
      "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return a compact list of the non-overlapping intervals that cover the input.",
    constraints:
      "1 <= intervals.length <= 10^4\\nintervals[i].length == 2\\n0 <= start_i <= end_i <= 10^4",
    editorial:
      "Sort by the start value, then grow the latest merged interval whenever the next interval overlaps.",
    categoryId: 1,
    subcategoryId: 15,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["sorting", "intervals"],
    companyNames: ["Google", "Meta"],
    functionName: "merge",
    javaSignature: "public int[][] merge(int[][] intervals)",
    pythonSignature: "def merge(self, intervals)",
    jsSignature: "function merge(intervals)",
    returnJava: "return new int[0][0];",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", sample: true, score: 1 },
      { input: "[[1,4],[4,5]]", output: "[[1,5]]", sample: true, score: 1 },
      { input: "[[1,4],[0,2],[3,5]]", output: "[[0,5]]", sample: false, score: 2 },
    ],
  },
  {
    id: 107,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    statement:
      "Given a string s, find the length of the longest substring without repeating characters.",
    constraints:
      "0 <= s.length <= 5 * 10^4\\ns consists of English letters, digits, symbols, and spaces.",
    editorial:
      "Track the latest index of each character and slide the left boundary past duplicates when they appear inside the active window.",
    categoryId: 1,
    subcategoryId: 17,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["sliding-window", "string", "hash-map"],
    companyNames: ["Amazon", "Netflix"],
    functionName: "lengthOfLongestSubstring",
    javaSignature: "public int lengthOfLongestSubstring(String s)",
    pythonSignature: "def length_of_longest_substring(self, s)",
    jsSignature: "function lengthOfLongestSubstring(s)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "abcabcbb", output: "3", sample: true, score: 1 },
      { input: "bbbbb", output: "1", sample: true, score: 1 },
      { input: "pwwkew", output: "3", sample: false, score: 2 },
    ],
  },
  {
    id: 108,
    title: "Kth Largest Element in an Array",
    difficulty: "MEDIUM",
    statement:
      "Given an integer array nums and an integer k, return the kth largest element in the array.",
    constraints:
      "1 <= k <= nums.length <= 10^5\\n-10^4 <= nums[i] <= 10^4",
    editorial:
      "A min-heap of size k keeps the current k largest values while scanning the array once.",
    categoryId: 3,
    subcategoryId: 18,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["heap", "array", "sorting"],
    companyNames: ["Meta", "Uber"],
    functionName: "findKthLargest",
    javaSignature: "public int findKthLargest(int[] nums, int k)",
    pythonSignature: "def find_kth_largest(self, nums, k)",
    jsSignature: "function findKthLargest(nums, k)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "[3,2,1,5,6,4]\\n2", output: "5", sample: true, score: 1 },
      { input: "[3,2,3,1,2,4,5,5,6]\\n4", output: "4", sample: true, score: 1 },
      { input: "[7,6,5,4,3,2,1]\\n1", output: "7", sample: false, score: 2 },
    ],
  },
  {
    id: 109,
    title: "Product of Array Except Self",
    difficulty: "MEDIUM",
    statement:
      "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
    constraints:
      "2 <= nums.length <= 10^5\\n-30 <= nums[i] <= 30\\nThe product of any prefix or suffix fits in a 32-bit integer.",
    editorial:
      "Build prefix products from the left and suffix products from the right, then combine them without division.",
    categoryId: 1,
    subcategoryId: 11,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["array", "prefix-suffix"],
    companyNames: ["Google", "Meta"],
    functionName: "productExceptSelf",
    javaSignature: "public int[] productExceptSelf(int[] nums)",
    pythonSignature: "def product_except_self(self, nums)",
    jsSignature: "function productExceptSelf(nums)",
    returnJava: "return new int[0];",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[1,2,3,4]", output: "[24,12,8,6]", sample: true, score: 1 },
      { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]", sample: true, score: 1 },
      { input: "[2,3,4,5]", output: "[60,40,30,24]", sample: false, score: 2 },
    ],
  },
  {
    id: 110,
    title: "Number of Islands",
    difficulty: "MEDIUM",
    statement:
      "Given an m x n binary grid of land and water cells, return the number of islands.",
    constraints:
      "1 <= m, n <= 300\\ngrid[i][j] is either 0 or 1.",
    editorial:
      "Traverse the grid and start a DFS or BFS every time you encounter unvisited land. Each traversal marks one whole island.",
    categoryId: 1,
    subcategoryId: 22,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["graph", "matrix", "bfs", "dfs"],
    companyNames: ["Amazon", "Microsoft"],
    functionName: "numIslands",
    javaSignature: "public int numIslands(char[][] grid)",
    pythonSignature: "def num_islands(self, grid)",
    jsSignature: "function numIslands(grid)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "11110\\n11010\\n11000\\n00000", output: "1", sample: true, score: 1 },
      { input: "11000\\n11000\\n00100\\n00011", output: "3", sample: true, score: 1 },
      { input: "111\\n010\\n111", output: "1", sample: false, score: 2 },
    ],
  },
  {
    id: 111,
    title: "Longest Consecutive Sequence",
    difficulty: "MEDIUM",
    statement:
      "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.",
    constraints:
      "0 <= nums.length <= 10^5\\n-10^9 <= nums[i] <= 10^9",
    editorial:
      "Place all values in a set and only start counting when the current value has no predecessor. This keeps the scan linear.",
    categoryId: 3,
    subcategoryId: 16,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["set", "hash-map"],
    companyNames: ["Google", "Netflix"],
    functionName: "longestConsecutive",
    javaSignature: "public int longestConsecutive(int[] nums)",
    pythonSignature: "def longest_consecutive(self, nums)",
    jsSignature: "function longestConsecutive(nums)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "[100,4,200,1,3,2]", output: "4", sample: true, score: 1 },
      { input: "[0,3,7,2,5,8,4,6,0,1]", output: "9", sample: true, score: 1 },
      { input: "[1,2,0,1]", output: "3", sample: false, score: 2 },
    ],
  },
  {
    id: 112,
    title: "Coin Change",
    difficulty: "MEDIUM",
    statement:
      "You are given an integer array coins representing coin denominations and an integer amount. Return the fewest number of coins needed to make up that amount.",
    constraints:
      "1 <= coins.length <= 12\\n0 <= amount <= 10^4\\n1 <= coins[i] <= 2^31 - 1",
    editorial:
      "Use bottom-up dynamic programming where dp[x] stores the minimum coins needed to make amount x.",
    categoryId: 1,
    subcategoryId: 20,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["dynamic-programming", "array"],
    companyNames: ["Uber", "Atlassian"],
    functionName: "coinChange",
    javaSignature: "public int coinChange(int[] coins, int amount)",
    pythonSignature: "def coin_change(self, coins, amount)",
    jsSignature: "function coinChange(coins, amount)",
    returnJava: "return -1;",
    returnPython: "return -1",
    returnJs: "return -1;",
    testCases: [
      { input: "[1,2,5]\\n11", output: "3", sample: true, score: 1 },
      { input: "[2]\\n3", output: "-1", sample: true, score: 1 },
      { input: "[1]\\n0", output: "0", sample: false, score: 2 },
    ],
  },
  {
    id: 113,
    title: "Top K Frequent Elements",
    difficulty: "MEDIUM",
    statement:
      "Given an integer array nums and an integer k, return the k most frequent elements in any order.",
    constraints:
      "1 <= nums.length <= 10^5\\nk is in the range [1, the number of unique elements].",
    editorial:
      "Count frequencies first, then use a heap or bucket sort to extract the top k keys.",
    categoryId: 3,
    subcategoryId: 18,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["heap", "hash-map", "array"],
    companyNames: ["Meta", "Amazon"],
    functionName: "topKFrequent",
    javaSignature: "public int[] topKFrequent(int[] nums, int k)",
    pythonSignature: "def top_k_frequent(self, nums, k)",
    jsSignature: "function topKFrequent(nums, k)",
    returnJava: "return new int[0];",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[1,1,1,2,2,3]\\n2", output: "[1,2]", sample: true, score: 1 },
      { input: "[1]\\n1", output: "[1]", sample: true, score: 1 },
      { input: "[4,4,4,6,6,7,7,7,8]\\n2", output: "[4,7]", sample: false, score: 2 },
    ],
  },
  {
    id: 114,
    title: "Search in Rotated Sorted Array",
    difficulty: "MEDIUM",
    statement:
      "There is an integer array nums sorted in ascending order with distinct values and then rotated. Return the index of target if found, otherwise -1.",
    constraints:
      "1 <= nums.length <= 5000\\n-10^4 <= nums[i], target <= 10^4\\nAll values are unique.",
    editorial:
      "Use binary search and identify which half is still sorted at every step before deciding where to continue.",
    categoryId: 1,
    subcategoryId: 14,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["binary-search", "array"],
    companyNames: ["Google", "Microsoft"],
    functionName: "searchRotated",
    javaSignature: "public int search(int[] nums, int target)",
    pythonSignature: "def search(self, nums, target)",
    jsSignature: "function search(nums, target)",
    returnJava: "return -1;",
    returnPython: "return -1",
    returnJs: "return -1;",
    testCases: [
      { input: "[4,5,6,7,0,1,2]\\n0", output: "4", sample: true, score: 1 },
      { input: "[4,5,6,7,0,1,2]\\n3", output: "-1", sample: true, score: 1 },
      { input: "[1]\\n0", output: "-1", sample: false, score: 2 },
    ],
  },
  {
    id: 115,
    title: "3Sum",
    difficulty: "MEDIUM",
    statement:
      "Given an integer array nums, return all the unique triplets [nums[i], nums[j], nums[k]] such that they sum to zero.",
    constraints:
      "3 <= nums.length <= 3000\\n-10^5 <= nums[i] <= 10^5",
    editorial:
      "Sort the array, fix one pivot, then use a left and right pointer to search for pairs that complete the sum.",
    categoryId: 1,
    subcategoryId: 26,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["array", "two-pointers", "sorting"],
    companyNames: ["Meta", "Airbnb"],
    functionName: "threeSum",
    javaSignature: "public List<List<Integer>> threeSum(int[] nums)",
    pythonSignature: "def three_sum(self, nums)",
    jsSignature: "function threeSum(nums)",
    returnJava: "return new ArrayList<>();",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", sample: true, score: 1 },
      { input: "[0,1,1]", output: "[]", sample: true, score: 1 },
      { input: "[0,0,0]", output: "[[0,0,0]]", sample: false, score: 2 },
    ],
  },
  {
    id: 116,
    title: "Group Anagrams",
    difficulty: "MEDIUM",
    statement:
      "Given an array of strings strs, group the anagrams together in any order.",
    constraints:
      "1 <= strs.length <= 10^4\\n0 <= strs[i].length <= 100\\nstrs[i] consists of lowercase English letters.",
    editorial:
      "Use the sorted characters or a frequency signature as the grouping key.",
    categoryId: 3,
    subcategoryId: 16,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["string", "hash-map"],
    companyNames: ["Amazon", "Atlassian"],
    functionName: "groupAnagrams",
    javaSignature: "public List<List<String>> groupAnagrams(String[] strs)",
    pythonSignature: "def group_anagrams(self, strs)",
    jsSignature: "function groupAnagrams(strs)",
    returnJava: "return new ArrayList<>();",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", sample: true, score: 1 },
      { input: "[\"\"]", output: "[[\"\"]]", sample: true, score: 1 },
      { input: "[\"a\"]", output: "[[\"a\"]]", sample: false, score: 2 },
    ],
  },
  {
    id: 117,
    title: "Daily Temperatures",
    difficulty: "MEDIUM",
    statement:
      "Given a list of daily temperatures, return an array where each value is the number of days to wait until a warmer temperature.",
    constraints:
      "1 <= temperatures.length <= 10^5\\n30 <= temperatures[i] <= 100",
    editorial:
      "A monotonic decreasing stack of indices lets you resolve waiting days when a warmer temperature appears.",
    categoryId: 3,
    subcategoryId: 13,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["stack", "array"],
    companyNames: ["Meta", "Adobe"],
    functionName: "dailyTemperatures",
    javaSignature: "public int[] dailyTemperatures(int[] temperatures)",
    pythonSignature: "def daily_temperatures(self, temperatures)",
    jsSignature: "function dailyTemperatures(temperatures)",
    returnJava: "return new int[0];",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", sample: true, score: 1 },
      { input: "[30,40,50,60]", output: "[1,1,1,0]", sample: true, score: 1 },
      { input: "[30,60,90]", output: "[1,1,0]", sample: false, score: 2 },
    ],
  },
  {
    id: 118,
    title: "Minimum Window Substring",
    difficulty: "HARD",
    statement:
      "Given strings s and t, return the minimum window substring of s such that every character in t is included in the window.",
    constraints:
      "1 <= s.length, t.length <= 10^5\\ns and t consist of English letters.",
    editorial:
      "Track the counts of required characters and shrink the left edge only while the window still satisfies the target multiset.",
    categoryId: 1,
    subcategoryId: 17,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["sliding-window", "string", "hash-map"],
    companyNames: ["Google", "Meta"],
    functionName: "minWindow",
    javaSignature: "public String minWindow(String s, String t)",
    pythonSignature: "def min_window(self, s, t)",
    jsSignature: "function minWindow(s, t)",
    returnJava: "return \"\";",
    returnPython: "return \"\"",
    returnJs: "return \"\";",
    testCases: [
      { input: "ADOBECODEBANC\\nABC", output: "BANC", sample: true, score: 1 },
      { input: "a\\naa", output: "", sample: true, score: 1 },
      { input: "aa\\naa", output: "aa", sample: false, score: 2 },
    ],
  },
  {
    id: 119,
    title: "Clone Graph",
    difficulty: "MEDIUM",
    statement:
      "Given a reference of a node in a connected undirected graph, return a deep copy of the graph.",
    constraints:
      "The number of nodes is in the range [0, 100].\\n1 <= Node.val <= 100",
    editorial:
      "Use DFS or BFS plus a map from original nodes to their cloned counterparts to avoid recreating nodes.",
    categoryId: 1,
    subcategoryId: 19,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["graph", "dfs", "bfs"],
    companyNames: ["Meta", "Google"],
    functionName: "cloneGraph",
    javaSignature: "public Node cloneGraph(Node node)",
    pythonSignature: "def clone_graph(self, node)",
    jsSignature: "function cloneGraph(node)",
    returnJava: "return null;",
    returnPython: "return None",
    returnJs: "return null;",
    testCases: [
      { input: "[[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", sample: true, score: 1 },
      { input: "[[]]", output: "[[]]", sample: true, score: 1 },
      { input: "[]", output: "[]", sample: false, score: 2 },
    ],
  },
  {
    id: 120,
    title: "Course Schedule",
    difficulty: "MEDIUM",
    statement:
      "There are numCourses courses labeled from 0 to numCourses - 1. Return true if you can finish all courses given prerequisite pairs.",
    constraints:
      "1 <= numCourses <= 2000\\n0 <= prerequisites.length <= 5000",
    editorial:
      "Model prerequisites as a graph and detect cycles with DFS state tracking or Kahn's topological sort.",
    categoryId: 1,
    subcategoryId: 27,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["graph", "topological-sort", "dfs"],
    companyNames: ["Amazon", "Google"],
    functionName: "canFinish",
    javaSignature: "public boolean canFinish(int numCourses, int[][] prerequisites)",
    pythonSignature: "def can_finish(self, num_courses, prerequisites)",
    jsSignature: "function canFinish(numCourses, prerequisites)",
    returnJava: "return false;",
    returnPython: "return False",
    returnJs: "return false;",
    testCases: [
      { input: "2\\n[[1,0]]", output: "true", sample: true, score: 1 },
      { input: "2\\n[[1,0],[0,1]]", output: "false", sample: true, score: 1 },
      { input: "4\\n[[1,0],[2,1],[3,2]]", output: "true", sample: false, score: 2 },
    ],
  },
  {
    id: 121,
    title: "Rotting Oranges",
    difficulty: "MEDIUM",
    statement:
      "You are given a grid where each cell can be empty, fresh, or rotten. Return the minimum number of minutes until no fresh orange remains, or -1 if impossible.",
    constraints:
      "1 <= grid.length, grid[i].length <= 10\\ngrid[i][j] is 0, 1, or 2.",
    editorial:
      "Run multi-source BFS from all initially rotten oranges and spread minute by minute across neighboring fresh cells.",
    categoryId: 1,
    subcategoryId: 22,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["matrix", "bfs", "queue"],
    companyNames: ["Amazon", "Microsoft"],
    functionName: "orangesRotting",
    javaSignature: "public int orangesRotting(int[][] grid)",
    pythonSignature: "def oranges_rotting(self, grid)",
    jsSignature: "function orangesRotting(grid)",
    returnJava: "return -1;",
    returnPython: "return -1",
    returnJs: "return -1;",
    testCases: [
      { input: "[[2,1,1],[1,1,0],[0,1,1]]", output: "4", sample: true, score: 1 },
      { input: "[[2,1,1],[0,1,1],[1,0,1]]", output: "-1", sample: true, score: 1 },
      { input: "[[0,2]]", output: "0", sample: false, score: 2 },
    ],
  },
  {
    id: 122,
    title: "Pacific Atlantic Water Flow",
    difficulty: "MEDIUM",
    statement:
      "Given a matrix of heights, return all coordinates where water can flow to both the Pacific and Atlantic oceans.",
    constraints:
      "m == heights.length\\nn == heights[r].length\\n1 <= m, n <= 200",
    editorial:
      "Reverse the flow: start DFS or BFS from the ocean edges and mark cells that can be reached from each side.",
    categoryId: 1,
    subcategoryId: 22,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["matrix", "graph", "dfs", "bfs"],
    companyNames: ["Google", "Airbnb"],
    functionName: "pacificAtlantic",
    javaSignature: "public List<List<Integer>> pacificAtlantic(int[][] heights)",
    pythonSignature: "def pacific_atlantic(self, heights)",
    jsSignature: "function pacificAtlantic(heights)",
    returnJava: "return new ArrayList<>();",
    returnPython: "return []",
    returnJs: "return [];",
    testCases: [
      { input: "[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]", sample: true, score: 1 },
      { input: "[[1]]", output: "[[0,0]]", sample: true, score: 1 },
      { input: "[[2,1],[1,2]]", output: "[[0,0],[0,1],[1,0],[1,1]]", sample: false, score: 2 },
    ],
  },
  {
    id: 123,
    title: "Implement LRU Cache",
    difficulty: "MEDIUM",
    statement:
      "Design a data structure that follows the constraints of a Least Recently Used cache with get and put in O(1) time.",
    constraints:
      "1 <= capacity <= 3000\\n0 <= key, value <= 10^4",
    editorial:
      "Combine a hash map for lookups with a doubly linked list for recency ordering.",
    categoryId: 2,
    subcategoryId: 21,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tagNames: ["design", "cache", "linked-list", "hash-map"],
    companyNames: ["Meta", "Amazon"],
    functionName: "LRUCache",
    javaSignature: "public LRUCache(int capacity)",
    pythonSignature: "def __init__(self, capacity)",
    jsSignature: "class LRUCache",
    returnJava: "// implement constructor and methods",
    returnPython: "pass",
    returnJs: "// implement constructor and methods",
    isClassTemplate: true,
    classMethods: {
      java: [
        "public int get(int key) {",
        "    return -1;",
        "}",
        "",
        "public void put(int key, int value) {",
        "}",
      ],
      python: [
        "def get(self, key):",
        "    return -1",
        "",
        "def put(self, key, value):",
        "    pass",
      ],
      js: [
        "  get(key) {",
        "    return -1;",
        "  }",
        "",
        "  put(key, value) {",
        "  }",
        "}",
        "",
        "module.exports = LRUCache;",
      ],
    },
    testCases: [
      { input: "[[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]\\n2", output: "[null,null,1,null,-1,null,-1,3,4]", sample: true, score: 1 },
      { input: "[[2,1],[2],[3,2],[2],[4,3],[1],[3],[4]]\\n2", output: "[null,1,null,1,null,-1,2,3]", sample: true, score: 1 },
      { input: "[[2,1],[1,1],[2],[4,1],[1],[2]]\\n1", output: "[null,null,1,null,-1,1]", sample: false, score: 2 },
    ],
  },
  {
    id: 124,
    title: "Merge K Sorted Lists",
    difficulty: "HARD",
    statement:
      "You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list.",
    constraints:
      "k == lists.length\\n0 <= k <= 10^4\\n0 <= lists[i].length <= 500",
    editorial:
      "Push the current head of each list into a min-heap and repeatedly extract the smallest node while advancing that list.",
    categoryId: 3,
    subcategoryId: 18,
    timeLimitMs: 2500,
    memoryLimitMb: 256,
    tagNames: ["linked-list", "heap"],
    companyNames: ["Google", "Stripe"],
    functionName: "mergeKLists",
    javaSignature: "public ListNode mergeKLists(ListNode[] lists)",
    pythonSignature: "def merge_k_lists(self, lists)",
    jsSignature: "function mergeKLists(lists)",
    returnJava: "return null;",
    returnPython: "return None",
    returnJs: "return null;",
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", sample: true, score: 1 },
      { input: "[]", output: "[]", sample: true, score: 1 },
      { input: "[[]]", output: "[]", sample: false, score: 2 },
    ],
  },
  {
    id: 125,
    title: "Reverse Linked List",
    difficulty: "EASY",
    statement:
      "Given the head of a singly linked list, reverse the list and return the new head.",
    constraints:
      "The number of nodes in the list is in the range [0, 5000].",
    editorial:
      "Iteratively reroute next pointers while keeping track of the previous and current nodes.",
    categoryId: 3,
    subcategoryId: 23,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["linked-list"],
    companyNames: ["Meta", "Amazon"],
    functionName: "reverseList",
    javaSignature: "public ListNode reverseList(ListNode head)",
    pythonSignature: "def reverse_list(self, head)",
    jsSignature: "function reverseList(head)",
    returnJava: "return null;",
    returnPython: "return None",
    returnJs: "return null;",
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", sample: true, score: 1 },
      { input: "[1,2]", output: "[2,1]", sample: true, score: 1 },
      { input: "[]", output: "[]", sample: false, score: 2 },
    ],
  },
  {
    id: 126,
    title: "Reorder List",
    difficulty: "MEDIUM",
    statement:
      "Given the head of a singly linked list, reorder it to follow the pattern L0 → Ln → L1 → Ln-1 → L2 → Ln-2.",
    constraints:
      "The number of nodes in the list is in the range [1, 5 * 10^4].",
    editorial:
      "Split the list in the middle, reverse the second half, then weave the two halves together.",
    categoryId: 3,
    subcategoryId: 23,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["linked-list"],
    companyNames: ["Meta", "Google"],
    functionName: "reorderList",
    javaSignature: "public void reorderList(ListNode head)",
    pythonSignature: "def reorder_list(self, head)",
    jsSignature: "function reorderList(head)",
    returnJava: "// reorder in place",
    returnPython: "pass",
    returnJs: "// reorder in place",
    testCases: [
      { input: "[1,2,3,4]", output: "[1,4,2,3]", sample: true, score: 1 },
      { input: "[1,2,3,4,5]", output: "[1,5,2,4,3]", sample: true, score: 1 },
      { input: "[1,2]", output: "[1,2]", sample: false, score: 2 },
    ],
  },
  {
    id: 127,
    title: "Maximum Subarray",
    difficulty: "MEDIUM",
    statement:
      "Given an integer array nums, find the contiguous subarray with the largest sum and return that sum.",
    constraints:
      "1 <= nums.length <= 10^5\\n-10^4 <= nums[i] <= 10^4",
    editorial:
      "Use Kadane's algorithm by deciding at every element whether to extend the current run or start a new one.",
    categoryId: 1,
    subcategoryId: 20,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["array", "dynamic-programming"],
    companyNames: ["Microsoft", "Amazon"],
    functionName: "maxSubArray",
    javaSignature: "public int maxSubArray(int[] nums)",
    pythonSignature: "def max_sub_array(self, nums)",
    jsSignature: "function maxSubArray(nums)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", sample: true, score: 1 },
      { input: "[1]", output: "1", sample: true, score: 1 },
      { input: "[5,4,-1,7,8]", output: "23", sample: false, score: 2 },
    ],
  },
  {
    id: 128,
    title: "House Robber",
    difficulty: "MEDIUM",
    statement:
      "You are a professional robber planning to rob houses along a street. Return the maximum amount you can rob without taking adjacent houses.",
    constraints:
      "1 <= nums.length <= 100\\n0 <= nums[i] <= 400",
    editorial:
      "Dynamic programming with two rolling states is enough: best if you take the current house versus skip it.",
    categoryId: 1,
    subcategoryId: 20,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["dynamic-programming", "array"],
    companyNames: ["Google", "Meta"],
    functionName: "rob",
    javaSignature: "public int rob(int[] nums)",
    pythonSignature: "def rob(self, nums)",
    jsSignature: "function rob(nums)",
    returnJava: "return 0;",
    returnPython: "return 0",
    returnJs: "return 0;",
    testCases: [
      { input: "[1,2,3,1]", output: "4", sample: true, score: 1 },
      { input: "[2,7,9,3,1]", output: "12", sample: true, score: 1 },
      { input: "[2,1,1,2]", output: "4", sample: false, score: 2 },
    ],
  },
  {
    id: 129,
    title: "Word Break",
    difficulty: "MEDIUM",
    statement:
      "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    constraints:
      "1 <= s.length <= 300\\n1 <= wordDict.length <= 1000",
    editorial:
      "Use dynamic programming where dp[i] means the prefix ending at i can be segmented from earlier valid prefixes.",
    categoryId: 1,
    subcategoryId: 20,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tagNames: ["dynamic-programming", "string"],
    companyNames: ["Amazon", "Airbnb"],
    functionName: "wordBreak",
    javaSignature: "public boolean wordBreak(String s, List<String> wordDict)",
    pythonSignature: "def word_break(self, s, word_dict)",
    jsSignature: "function wordBreak(s, wordDict)",
    returnJava: "return false;",
    returnPython: "return False",
    returnJs: "return false;",
    testCases: [
      { input: "leetcode\\n[\"leet\",\"code\"]", output: "true", sample: true, score: 1 },
      { input: "applepenapple\\n[\"apple\",\"pen\"]", output: "true", sample: true, score: 1 },
      { input: "catsandog\\n[\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]", output: "false", sample: false, score: 2 },
    ],
  },
  {
    id: 130,
    title: "Jump Game",
    difficulty: "MEDIUM",
    statement:
      "You are given an array nums where each element represents the maximum jump length at that position. Return true if you can reach the last index.",
    constraints:
      "1 <= nums.length <= 10^4\\n0 <= nums[i] <= 10^5",
    editorial:
      "Track the farthest reachable index while scanning left to right and fail immediately once the current index is unreachable.",
    categoryId: 1,
    subcategoryId: 25,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tagNames: ["greedy", "array"],
    companyNames: ["Google", "Stripe"],
    functionName: "canJump",
    javaSignature: "public boolean canJump(int[] nums)",
    pythonSignature: "def can_jump(self, nums)",
    jsSignature: "function canJump(nums)",
    returnJava: "return false;",
    returnPython: "return False",
    returnJs: "return false;",
    testCases: [
      { input: "[2,3,1,1,4]", output: "true", sample: true, score: 1 },
      { input: "[3,2,1,0,4]", output: "false", sample: true, score: 1 },
      { input: "[0]", output: "true", sample: false, score: 2 },
    ],
  },
];

const quizzes = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "HTML Semantics Essentials",
    description: "Covers semantic HTML, landmarks, form labeling, and accessible document structure.",
    durationMinutes: 15,
    category: "Frontend",
    subCategory: "HTML",
    difficulty: "EASY",
    questions: [
      q("a1111111-1111-1111-1111-111111111111", "Which element is most appropriate for primary navigation links?", ["<div>", "<nav>", "<section>", "<aside>"], "B"),
      q("a1111111-1111-1111-1111-111111111112", "What is the main purpose of semantic HTML?", ["To reduce CSS size", "To improve meaning and accessibility", "To avoid JavaScript", "To increase image quality"], "B"),
      q("a1111111-1111-1111-1111-111111111113", "Which heading order is best for accessibility?", ["Use any heading for styling", "Start with h3", "Use one h1 and nest logically", "Never use headings"], "C"),
      q("a1111111-1111-1111-1111-111111111114", "Which attribute best associates helper text with an input?", ["placeholder", "aria-describedby", "rel", "target"], "B"),
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "CSS Layout Foundations",
    description: "Tests flexbox, grid, spacing systems, and responsive layout behavior.",
    durationMinutes: 18,
    category: "Frontend",
    subCategory: "CSS",
    difficulty: "EASY",
    questions: [
      q("b2222222-2222-2222-2222-222222222221", "Which layout system is best for two-dimensional page layouts?", ["float", "absolute positioning", "grid", "inline-block"], "C"),
      q("b2222222-2222-2222-2222-222222222222", "What does justify-content control in flexbox?", ["Alignment on the main axis", "Text wrapping", "Element visibility", "Z-index order"], "A"),
      q("b2222222-2222-2222-2222-222222222223", "Which unit is relative to the root font size?", ["px", "em", "rem", "vh"], "C"),
      q("b2222222-2222-2222-2222-222222222224", "Which property keeps padding inside width calculations?", ["display", "box-sizing", "overflow-wrap", "object-fit"], "B"),
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "JavaScript Browser Basics",
    description: "Reviews closures, scope, DOM events, promises, and asynchronous browser behavior.",
    durationMinutes: 20,
    category: "Frontend",
    subCategory: "JavaScript",
    difficulty: "MEDIUM",
    questions: [
      q("c3333333-3333-3333-3333-333333333331", "What does a closure give a JavaScript function?", ["Lexical-scope access", "Automatic memoization", "Faster rendering", "Global this"], "A"),
      q("c3333333-3333-3333-3333-333333333332", "Which browser API is commonly used to delay execution?", ["querySelector", "setTimeout", "fetchLater", "style.delay"], "B"),
      q("c3333333-3333-3333-3333-333333333333", "Which keyword creates a block-scoped variable?", ["var", "const", "scope", "global"], "B"),
      q("c3333333-3333-3333-3333-333333333334", "What is the main benefit of Promise.all for independent work?", ["Serial execution", "Concurrent waiting", "Automatic cancellation", "Callback conversion"], "B"),
    ],
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "SQL Joins and Indexing",
    description: "Checks practical SQL joins, indexing tradeoffs, grouping logic, and query reasoning.",
    durationMinutes: 20,
    category: "Backend",
    subCategory: "SQL",
    difficulty: "MEDIUM",
    questions: [
      q("d4444444-4444-4444-4444-444444444441", "Which join returns rows matching both tables?", ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"], "C"),
      q("d4444444-4444-4444-4444-444444444442", "What is a good reason to add an index?", ["Faster filtered lookups", "Reduce every insert cost", "Replace primary keys", "Remove normalization"], "A"),
      q("d4444444-4444-4444-4444-444444444443", "Which clause is evaluated after WHERE in a grouped query?", ["ORDER BY", "GROUP BY", "HAVING", "LIMIT"], "B"),
      q("d4444444-4444-4444-4444-444444444444", "What is the main tradeoff of too many indexes?", ["Fewer joins", "Faster writes", "Slower writes and more storage", "Smaller tables"], "C"),
    ],
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Java OOP and Collections",
    description: "Assesses interfaces, inheritance, polymorphism, streams, and collection choice.",
    durationMinutes: 18,
    category: "Java",
    subCategory: "OOP",
    difficulty: "MEDIUM",
    questions: [
      q("e5555555-5555-5555-5555-555555555551", "Which collection preserves insertion order and allows fast lookup?", ["HashSet", "TreeMap", "LinkedHashMap", "PriorityQueue"], "C"),
      q("e5555555-5555-5555-5555-555555555552", "What does polymorphism allow?", ["One class stores one type", "Different implementations behind the same interface", "Multiple constructors only", "Compile-time SQL"], "B"),
      q("e5555555-5555-5555-5555-555555555553", "Which interface represents key-value pairs?", ["List", "Set", "Map", "Queue"], "C"),
      q("e5555555-5555-5555-5555-555555555554", "Why use Optional as a return type?", ["Zero allocations", "Show a value may be absent", "Replace every field type", "Compile faster"], "B"),
    ],
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "System Design Fundamentals",
    description: "Covers scalability, caching, queues, APIs, and architecture tradeoffs.",
    durationMinutes: 22,
    category: "Backend",
    subCategory: "System Design",
    difficulty: "HARD",
    questions: [
      q("f6666666-6666-6666-6666-666666666661", "What does horizontal scaling mean?", ["More CPU on one box", "Add more machines", "Compress payloads", "Reduce rows"], "B"),
      q("f6666666-6666-6666-6666-666666666662", "Why is caching useful in distributed systems?", ["Guarantees consistency", "Reduces latency and repeated work", "Removes databases", "Prevents auth"], "B"),
      q("f6666666-6666-6666-6666-666666666663", "What is a common use of a load balancer?", ["Encrypt passwords", "Schedule cron jobs", "Distribute traffic", "Render charts"], "C"),
      q("f6666666-6666-6666-6666-666666666664", "Which component decouples bursty async processing?", ["Template engine", "Message queue", "CSS preprocessor", "Local storage"], "B"),
    ],
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "React State and Hooks",
    description: "Focuses on state updates, derived state, effects, hooks rules, and component composition.",
    durationMinutes: 18,
    category: "Frontend",
    subCategory: "React",
    difficulty: "MEDIUM",
    questions: [
      q("77777777-7777-7777-7777-777777777771", "When should you derive state instead of duplicating it?", ["When it can be computed from other state", "Only in class components", "Only with Redux", "Never"], "A"),
      q("77777777-7777-7777-7777-777777777772", "What is the purpose of the useEffect dependency array?", ["CSS priorities", "Control reruns", "Memoize JSX", "Create refs"], "B"),
      q("77777777-7777-7777-7777-777777777773", "Which hook stores mutable values without rerendering?", ["useState", "useMemo", "useRef", "useEffect"], "C"),
      q("77777777-7777-7777-7777-777777777774", "Why split a React component into smaller pieces?", ["Increase bundle size", "Improve readability and isolate responsibility", "Disable rerenders", "Avoid props"], "B"),
    ],
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    title: "Spring Boot APIs and Persistence",
    description: "Reviews MVC layering, validation, transactions, JPA fetching, and API design.",
    durationMinutes: 20,
    category: "Backend",
    subCategory: "Spring Boot",
    difficulty: "MEDIUM",
    questions: [
      q("88888888-8888-8888-8888-888888888881", "Why keep controllers thin in Spring Boot?", ["Move all logic into entities", "Separate orchestration from business rules", "Avoid DI", "Disable validation"], "B"),
      q("88888888-8888-8888-8888-888888888882", "What problem can @Transactional help solve?", ["CSS duplication", "All-or-nothing unit of work", "Frontend caching", "JWT expiration"], "B"),
      q("88888888-8888-8888-8888-888888888883", "Which JPA issue appears when child collections load outside a session?", ["Circular dependency", "LazyInitializationException", "BeanNotFoundException", "Template error"], "B"),
      q("88888888-8888-8888-8888-888888888884", "What is the main value of DTOs?", ["Replace persistence", "Shape API responses without exposing entities", "Remove validation", "Force sync processing"], "B"),
    ],
  },
  {
    id: "99999999-9999-9999-9999-999999999999",
    title: "Backend API Security",
    description: "Tests authentication, authorization, secret handling, rate limiting, and secure transport basics.",
    durationMinutes: 18,
    category: "Backend",
    subCategory: "Security",
    difficulty: "HARD",
    questions: [
      q("99999999-9999-9999-9999-999999999991", "Which control determines what an authenticated user may do?", ["Caching", "Authorization", "Serialization", "Indexing"], "B"),
      q("99999999-9999-9999-9999-999999999992", "Why keep secrets out of source control?", ["Reduce CPU", "Prevent accidental disclosure", "Enable larger images", "Make hashing unnecessary"], "B"),
      q("99999999-9999-9999-9999-999999999993", "What is a practical purpose of API rate limiting?", ["Improve typography", "Slow legitimate databases", "Reduce abuse and protect capacity", "Encrypt data at rest"], "C"),
      q("99999999-9999-9999-9999-999999999994", "What is the security benefit of HTTPS?", ["Compress SQL", "Protect data in transit", "Remove auth", "Replace password hashing"], "B"),
    ],
  },
  {
    id: "12121212-1212-1212-1212-121212121212",
    title: "Algorithmic Pattern Recognition",
    description: "Covers sliding windows, prefix products, BFS/DFS, heaps, and common interview patterns.",
    durationMinutes: 22,
    category: "Coding",
    subCategory: "Algorithms",
    difficulty: "HARD",
    questions: [
      q("a1212121-1212-1212-1212-121212121211", "Which pattern fits longest substring with unique characters?", ["Binary search", "Sliding window", "Topological sort", "Union find"], "B"),
      q("a1212121-1212-1212-1212-121212121212", "With equal edge weights, which traversal finds shortest path first?", ["DFS", "BFS", "Backtracking", "Quick sort"], "B"),
      q("a1212121-1212-1212-1212-121212121213", "Which structure helps track the kth largest element in a stream?", ["Queue", "Stack", "Min-heap of size k", "Trie"], "C"),
      q("a1212121-1212-1212-1212-121212121214", "Which idea powers Product of Array Except Self without division?", ["Prefix and suffix products", "Adjacency lists", "Interval merging", "Parsing"], "A"),
    ],
  },
  {
    id: "13131313-1313-1313-1313-131313131313",
    title: "Frontend Performance and Accessibility",
    description: "Explores rendering cost, accessibility checks, performance budgets, and UX-safe optimizations.",
    durationMinutes: 18,
    category: "Frontend",
    subCategory: "Performance",
    difficulty: "MEDIUM",
    questions: [
      q("13131313-1313-1313-1313-131313131314", "What is a good reason to lazy-load a route?", ["To increase bundle size", "To reduce initial JavaScript downloaded", "To disable caching", "To remove code splitting"], "B"),
      q("13131313-1313-1313-1313-131313131315", "Which metric tracks visual layout movement during load?", ["FCP", "CLS", "TTFB", "INP"], "B"),
      q("13131313-1313-1313-1313-131313131316", "What does an accessible focus style primarily help with?", ["Image compression", "Keyboard navigation clarity", "HTTP retries", "Data validation"], "B"),
      q("13131313-1313-1313-1313-131313131317", "Why compress and optimize images on the web?", ["Reduce JavaScript syntax errors", "Lower transfer size and improve page speed", "Remove semantic markup", "Disable CDNs"], "B"),
    ],
  },
  {
    id: "14141414-1414-1414-1414-141414141414",
    title: "REST API Design Essentials",
    description: "Covers resource modeling, status codes, pagination, validation, and idempotent operations.",
    durationMinutes: 18,
    category: "Backend",
    subCategory: "API Design",
    difficulty: "MEDIUM",
    questions: [
      q("14141414-1414-1414-1414-141414141415", "Which HTTP method is generally idempotent for full replacement?", ["POST", "PUT", "PATCH", "CONNECT"], "B"),
      q("14141414-1414-1414-1414-141414141416", "Which status code best fits a successfully created resource?", ["200", "201", "204", "304"], "B"),
      q("14141414-1414-1414-1414-141414141417", "Why use cursor or page-based pagination?", ["To avoid validation", "To control response size and traversal", "To replace indexing", "To remove authentication"], "B"),
      q("14141414-1414-1414-1414-141414141418", "Where should request validation usually happen first?", ["Database triggers only", "At the API boundary", "In CSS", "At the CDN"], "B"),
    ],
  },
  {
    id: "15151515-1515-1515-1515-151515151515",
    title: "Docker and Container Basics",
    description: "Reviews image layering, container networking, environment injection, and reproducible builds.",
    durationMinutes: 16,
    category: "Platform",
    subCategory: "Docker",
    difficulty: "EASY",
    questions: [
      q("15151515-1515-1515-1515-151515151516", "What is a primary benefit of multi-stage Docker builds?", ["More mutable images", "Smaller runtime images", "No build cache", "Automatic TLS"], "B"),
      q("15151515-1515-1515-1515-151515151517", "What does a Docker volume help preserve?", ["Only logs in memory", "Persistent data outside container lifecycle", "CPU quota", "Kubernetes pods"], "B"),
      q("15151515-1515-1515-1515-151515151518", "Why pass configuration through environment variables?", ["To avoid all defaults", "To separate config from images", "To disable healthchecks", "To skip secrets rotation"], "B"),
      q("15151515-1515-1515-1515-151515151519", "What usually happens when a container image layer changes?", ["Only the changed layer and following layers rebuild", "Every image in Docker rebuilds", "All volumes are deleted", "Ports are closed permanently"], "A"),
    ],
  },
  {
    id: "16161616-1616-1616-1616-161616161616",
    title: "Redis Caching and Session Storage",
    description: "Covers cache hit strategy, TTLs, sessions, invalidation, and common misuse patterns.",
    durationMinutes: 16,
    category: "Backend",
    subCategory: "Redis",
    difficulty: "MEDIUM",
    questions: [
      q("16161616-1616-1616-1616-161616161617", "Why add a TTL to cached entries?", ["To force schema migrations", "To avoid stale data living forever", "To replace metrics", "To increase request payload size"], "B"),
      q("16161616-1616-1616-1616-161616161618", "What is a common use for Redis in auth systems?", ["Compile TypeScript", "Store sessions or OTPs with expiry", "Render frontend routes", "Resize images"], "B"),
      q("16161616-1616-1616-1616-161616161619", "What is cache invalidation concerned with?", ["Deleting source code", "Keeping cached values synchronized with truth", "Reducing HTTPS handshakes", "Avoiding load balancers"], "B"),
      q("16161616-1616-1616-1616-16161616161a", "Why should you be careful storing large objects in Redis?", ["They disable DNS", "They can increase memory pressure and network cost", "They prevent authentication", "They remove replication"], "B"),
    ],
  },
  {
    id: "17171717-1717-1717-1717-171717171717",
    title: "Git Collaboration Workflows",
    description: "Tests branch hygiene, review flow, rebasing awareness, and safe history management.",
    durationMinutes: 14,
    category: "Engineering",
    subCategory: "Git",
    difficulty: "EASY",
    questions: [
      q("17171717-1717-1717-1717-171717171718", "Why create feature branches?", ["To disable reviews", "To isolate work before merge", "To replace CI", "To avoid commits"], "B"),
      q("17171717-1717-1717-1717-171717171719", "Why is force-pushing shared branches risky?", ["It increases image size", "It can rewrite teammates' history", "It improves auditability", "It enables unit tests"], "B"),
      q("17171717-1717-1717-1717-17171717171a", "What is a pull request mainly for?", ["Runtime caching", "Code review and merge discussion", "Port forwarding", "Token encryption"], "B"),
      q("17171717-1717-1717-1717-17171717171b", "Why keep commits focused?", ["To reduce branch count", "To make review and rollback easier", "To disable linting", "To avoid CI"], "B"),
    ],
  },
  {
    id: "18181818-1818-1818-1818-181818181818",
    title: "Data Structures Essentials",
    description: "Reviews stacks, queues, maps, heaps, linked lists, and structure-selection tradeoffs.",
    durationMinutes: 18,
    category: "Coding",
    subCategory: "Data Structures",
    difficulty: "MEDIUM",
    questions: [
      q("18181818-1818-1818-1818-181818181819", "Which structure gives FIFO ordering?", ["Stack", "Queue", "Heap", "TreeMap"], "B"),
      q("18181818-1818-1818-1818-18181818181a", "Which structure helps repeatedly extract the smallest or largest item?", ["Linked list", "Heap", "Array", "Hash set"], "B"),
      q("18181818-1818-1818-1818-18181818181b", "Why choose a hash map over a list for membership checks?", ["Lower memory always", "Faster average lookup by key", "Automatic sorting", "Better recursion"], "B"),
      q("18181818-1818-1818-1818-18181818181c", "What is a linked list especially good at?", ["Random index access", "Cheap pointer-based insertion and removal", "Automatic de-duplication", "Matrix traversal"], "B"),
    ],
  },
  {
    id: "19191919-1919-1919-1919-191919191919",
    title: "Dynamic Programming Basics",
    description: "Focuses on states, transitions, overlapping subproblems, and bottom-up reasoning.",
    durationMinutes: 18,
    category: "Coding",
    subCategory: "Dynamic Programming",
    difficulty: "MEDIUM",
    questions: [
      q("19191919-1919-1919-1919-19191919191a", "What makes a problem a strong candidate for dynamic programming?", ["Independent subproblems only", "Overlapping subproblems and optimal substructure", "Only graph input", "Mandatory recursion"], "B"),
      q("19191919-1919-1919-1919-19191919191b", "What is a state in DP?", ["A CSS property", "A value that represents a subproblem result", "A network socket", "A database lock"], "B"),
      q("19191919-1919-1919-1919-19191919191c", "Why can bottom-up DP be preferred over recursion?", ["It removes all arrays", "It avoids recursion overhead and stack depth issues", "It avoids base cases", "It makes every problem greedy"], "B"),
      q("19191919-1919-1919-1919-19191919191d", "What is memoization?", ["Sorting inputs first", "Caching recursive subproblem results", "Using a queue for BFS", "Binary searching an answer"], "B"),
    ],
  },
  {
    id: "20202020-2020-2020-2020-202020202020",
    title: "Graph Traversal Patterns",
    description: "Tests DFS, BFS, visited-state handling, shortest-path intuition, and traversal tradeoffs.",
    durationMinutes: 18,
    category: "Coding",
    subCategory: "Graphs",
    difficulty: "MEDIUM",
    questions: [
      q("20202020-2020-2020-2020-202020202021", "Which traversal typically finds the shortest path first in an unweighted graph?", ["DFS", "BFS", "Backtracking", "Quick sort"], "B"),
      q("20202020-2020-2020-2020-202020202022", "Why track a visited set in graph traversal?", ["To increase duplicates", "To avoid infinite loops and repeat work", "To replace adjacency lists", "To store edge weights"], "B"),
      q("20202020-2020-2020-2020-202020202023", "When is DFS often a natural fit?", ["When you want queue-based breadth layers", "When exploring connected structure or backtracking deeply", "When sorting arrays", "When doing SQL joins"], "B"),
      q("20202020-2020-2020-2020-202020202024", "What does topological order require?", ["An undirected cyclic graph", "A directed acyclic graph", "Equal edge weights", "A min-heap"], "B"),
    ],
  },
  {
    id: "21212121-2121-2121-2121-212121212121",
    title: "Testing Strategy and QA",
    description: "Covers unit, integration, end-to-end testing, mocking boundaries, and release confidence.",
    durationMinutes: 16,
    category: "Engineering",
    subCategory: "Testing",
    difficulty: "MEDIUM",
    questions: [
      q("21212121-2121-2121-2121-212121212122", "What is the main purpose of a unit test?", ["Verify one small piece of behavior in isolation", "Replace all integration testing", "Benchmark Docker performance", "Provision databases"], "A"),
      q("21212121-2121-2121-2121-212121212123", "When is mocking most helpful?", ["When isolating a unit from slow or external collaborators", "When testing CSS colors", "When replacing every class", "When counting SQL rows"], "A"),
      q("21212121-2121-2121-2121-212121212124", "Why are end-to-end tests still useful after strong unit coverage?", ["They are always faster", "They validate real workflow wiring across layers", "They remove the need for reviews", "They prevent CI failures"], "B"),
      q("21212121-2121-2121-2121-212121212125", "What is a strong release signal?", ["Only local manual testing", "Passing automated checks plus focused live acceptance", "Zero logs", "No staging environment"], "B"),
    ],
  },
  {
    id: "23232323-2323-2323-2323-232323232323",
    title: "Microservices Observability",
    description: "Tests health checks, tracing, metrics, logs, dashboards, and alerting fundamentals.",
    durationMinutes: 18,
    category: "Platform",
    subCategory: "Observability",
    difficulty: "MEDIUM",
    questions: [
      q("23232323-2323-2323-2323-232323232324", "Why expose a health endpoint?", ["To replace authentication", "To let platforms and operators check liveness and readiness", "To store sessions", "To compress payloads"], "B"),
      q("23232323-2323-2323-2323-232323232325", "What do metrics usually help you see?", ["Only code style", "Aggregate system behavior over time", "Exact source maps", "Dockerfile syntax"], "B"),
      q("23232323-2323-2323-2323-232323232326", "Why are structured logs valuable?", ["They remove timestamps", "They make searching and correlation easier", "They disable tracing", "They replace dashboards"], "B"),
      q("23232323-2323-2323-2323-232323232327", "What is tracing especially useful for?", ["Single static pages only", "Following a request across multiple services", "Storing secrets", "Rotating databases"], "B"),
    ],
  },
];

const plans = [
  {
    slug: "dsa-basics",
    title: "DSA Basics",
    description: "Start with core interview mechanics across arrays, search, and pattern recognition.",
    track: "Coding",
    level: "Beginner",
    items: [
      itemProblem(1, "Arrays warmup", "Solve an introductory array lookup problem.", 101, 20),
      itemQuiz(2, "Pattern checkpoint", "Recognize core algorithmic patterns before coding deeper.", "12121212-1212-1212-1212-121212121212", 18),
      itemProblem(3, "Profit window drill", "Practice reasoning about local minima and maxima.", 103, 20),
      itemProblem(4, "Binary search confidence", "Lock in the classic sorted-search workflow.", 105, 25),
    ],
  },
  {
    slug: "java-problem-solving",
    title: "Java Problem Solving",
    description: "Blend Java platform knowledge with high-signal coding exercises used in interviews.",
    track: "Coding",
    level: "Intermediate",
    items: [
      itemProblem(1, "Anagram frequency map", "Use counting structures cleanly and efficiently.", 102, 20),
      itemQuiz(2, "Java platform checkpoint", "Review OOP, collections, and API selection tradeoffs.", "55555555-5555-5555-5555-555555555555", 18),
      itemProblem(3, "Heap-based ranking", "Use comparator-backed collections for ranked results.", 108, 30),
      itemProblem(4, "DP translation drill", "Turn a recurrence into an iterative Java solution.", 112, 35),
    ],
  },
  {
    slug: "frontend-mcq-revision",
    title: "Frontend MCQ Revision",
    description: "Revise the modern frontend stack through a clean progression from markup to React state.",
    track: "Frontend",
    level: "Beginner",
    items: [
      itemQuiz(1, "HTML and semantics", "Quick MCQ revision on semantic HTML.", "11111111-1111-1111-1111-111111111111", 15),
      itemQuiz(2, "CSS layouts", "Review flexbox and grid concepts.", "22222222-2222-2222-2222-222222222222", 15),
      itemQuiz(3, "JavaScript basics", "Strengthen core JS concept recall.", "33333333-3333-3333-3333-333333333333", 20),
      itemQuiz(4, "React state and hooks", "Connect browser fundamentals to component architecture.", "77777777-7777-7777-7777-777777777777", 20),
    ],
  },
  {
    slug: "sql-backend-quiz-track",
    title: "SQL + Backend Quiz Track",
    description: "Refresh backend and database concepts with a stronger service, persistence, and security arc.",
    track: "Backend",
    level: "Intermediate",
    items: [
      itemQuiz(1, "SQL joins and indexing", "Revise query optimization basics.", "44444444-4444-4444-4444-444444444444", 20),
      itemQuiz(2, "Spring data and APIs", "Review controller, service, JPA, and transaction design.", "88888888-8888-8888-8888-888888888888", 20),
      itemQuiz(3, "Backend API security", "Cover auth, secrets, and operational safety basics.", "99999999-9999-9999-9999-999999999999", 18),
      itemQuiz(4, "System design grounding", "Tie the backend pieces together with systems thinking.", "66666666-6666-6666-6666-666666666666", 22),
    ],
  },
  {
    slug: "algorithms-pattern-ladder",
    title: "Algorithms Pattern Ladder",
    description: "Climb through sliding windows, prefix products, graph traversal, and set-based reasoning.",
    track: "Coding",
    level: "Advanced",
    items: [
      itemProblem(1, "Sliding window mastery", "Practice maintaining a dynamic unique window.", 107, 30),
      itemProblem(2, "Prefix product reasoning", "Use left and right passes without division.", 109, 30),
      itemProblem(3, "Grid traversal systems", "Apply graph traversal cleanly on matrix input.", 110, 35),
      itemProblem(4, "Hash-set sequence scan", "Spot the optimal O(n) boundary detection pattern.", 111, 25),
    ],
  },
  {
    slug: "mixed-interview-prep",
    title: "Mixed Interview Prep",
    description: "Blend coding drills and architecture quizzes for broad interview readiness.",
    track: "Interview",
    level: "Advanced",
    items: [
      itemProblem(1, "Stack validity check", "Move quickly from symbols to stack invariants.", 104, 20),
      itemQuiz(2, "Pattern selection quiz", "Choose the best algorithm family before implementation.", "12121212-1212-1212-1212-121212121212", 20),
      itemProblem(3, "Intervals under pressure", "Sort first, then merge with confidence.", 106, 30),
      itemQuiz(4, "System design concepts quiz", "Review scaling and distributed systems tradeoffs.", "66666666-6666-6666-6666-666666666666", 22),
    ],
  },
  {
    slug: "graph-and-matrix-journey",
    title: "Graph and Matrix Journey",
    description: "Move from BFS fundamentals into graph cycles, ocean reachability, and traversal confidence.",
    track: "Coding",
    level: "Intermediate",
    items: [
      itemProblem(1, "Rotting oranges clock", "Use layer-by-layer BFS on a changing matrix.", 121, 25),
      itemQuiz(2, "Graph traversal refresher", "Review BFS, DFS, and visited-state tradeoffs.", "20202020-2020-2020-2020-202020202020", 18),
      itemProblem(3, "Course dependency check", "Reason about cycles before planning execution.", 120, 30),
      itemProblem(4, "Ocean reachability", "Reverse the water-flow perspective and mark reachable cells.", 122, 35),
    ],
  },
  {
    slug: "linked-list-and-cache-track",
    title: "Linked List and Cache Track",
    description: "Combine classic pointer problems with foundational cache design and ranked merging.",
    track: "Coding",
    level: "Intermediate",
    items: [
      itemProblem(1, "Reverse the baseline list", "Build pointer confidence with a clean iterative reverse.", 125, 20),
      itemProblem(2, "Reorder linked flow", "Split, reverse, and weave a list back together.", 126, 30),
      itemProblem(3, "Design an LRU cache", "Model O(1) lookup plus recency ordering.", 123, 35),
      itemProblem(4, "Merge many sorted lists", "Use a heap to keep the next smallest node visible.", 124, 35),
    ],
  },
  {
    slug: "backend-ops-foundations",
    title: "Backend Ops Foundations",
    description: "Strengthen API, container, cache, and observability instincts for production-facing services.",
    track: "Backend",
    level: "Intermediate",
    items: [
      itemQuiz(1, "REST API shape", "Choose better resource, status, and validation patterns.", "14141414-1414-1414-1414-141414141414", 18),
      itemQuiz(2, "Docker runtime thinking", "Understand image layering and runtime config separation.", "15151515-1515-1515-1515-151515151515", 16),
      itemQuiz(3, "Redis and sessions", "Use cache and session primitives with better operational judgment.", "16161616-1616-1616-1616-161616161616", 16),
      itemQuiz(4, "Observability signals", "Read health, metrics, logs, and traces as one operating loop.", "23232323-2323-2323-2323-232323232323", 18),
    ],
  },
  {
    slug: "algorithmic-interview-sprint",
    title: "Algorithmic Interview Sprint",
    description: "Run a sharper interview lap through grouping, frequency, DP, and greedy reachability.",
    track: "Interview",
    level: "Advanced",
    items: [
      itemProblem(1, "Group related strings", "Recognize signature-based grouping quickly.", 116, 25),
      itemProblem(2, "Top frequent extraction", "Move from counts to ranked results efficiently.", 113, 25),
      itemQuiz(3, "Dynamic programming basics", "Check whether states and transitions feel obvious yet.", "19191919-1919-1919-1919-191919191919", 18),
      itemProblem(4, "House and jump decisions", "Switch between DP and greedy reasoning under pressure.", 128, 25),
    ],
  },
];

function q(id, text, options, correct) {
  return { id, text, options, correct };
}

function itemProblem(sequence, title, description, problemId, estimatedMinutes) {
  return {
    sequence,
    title,
    description,
    itemType: "CODING_PROBLEM",
    referenceType: "problem",
    referenceId: String(problemId),
    referenceKey: `problem-${problemId}`,
    estimatedMinutes,
  };
}

function itemQuiz(sequence, title, description, quizId, estimatedMinutes) {
  return {
    sequence,
    title,
    description,
    itemType: "QUIZ",
    referenceType: "quiz",
    referenceId: quizId,
    referenceKey: `quiz-${quizId}`,
    estimatedMinutes,
  };
}

function escapeSql(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "''");
}

function sql(value) {
  if (value === null) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return `'${escapeSql(String(value))}'`;
}

function tagsCsv(list) {
  return list.join(",");
}

function makeJavaTemplate(problem) {
  if (problem.isClassTemplate) {
    return [
      "import java.util.*;",
      "",
      `class ${problem.functionName} {`,
      `    ${problem.javaSignature} {`,
      `        ${problem.returnJava}`,
      "    }",
      "",
      ...problem.classMethods.java.map((line) => `    ${line}`),
      "}",
      "",
    ].join("\n");
  }
  return [
    "import java.util.*;",
    "",
    "class Solution {",
    `    ${problem.javaSignature} {`,
    `        ${problem.returnJava}`,
    "    }",
    "}",
    "",
  ].join("\n");
}

function makePythonTemplate(problem) {
  if (problem.isClassTemplate) {
    return [
      "class LRUCache:",
      `    ${problem.pythonSignature}:`,
      "        pass",
      "",
      ...problem.classMethods.python.map((line) => `    ${line}`),
      "",
    ].join("\n");
  }
  return [
    "class Solution:",
    `    ${problem.pythonSignature}:`,
    `        ${problem.returnPython}`,
    "",
  ].join("\n");
}

function makeJsTemplate(problem) {
  if (problem.isClassTemplate) {
    return [
      "class LRUCache {",
      `  constructor(capacity) {`,
      "  }",
      "",
      ...problem.classMethods.js,
      "",
    ].join("\n");
  }
  return [
    `${problem.jsSignature} {`,
    `  ${problem.returnJs}`,
    "}",
    "",
    `module.exports = ${problem.functionName};`,
    "",
  ].join("\n");
}

function buildProblemSql() {
  const tagMap = new Map(tags.map((name, index) => [name, index + 1]));
  const companyMap = new Map(companies.map((name, index) => [name, index + 1]));

  const allTitles = problems.map((p) => p.title);
  const subcategoryKeys = problemSubcategories.map((s) => s.key);
  const categoryKeys = problemCategories.map((c) => c.key);

  let languageId = 1001;
  let templateId = 2001;
  let testCaseId = 3001;
  let problemTagId = 4001;
  let problemCompanyId = 5001;

  const lines = [];
  lines.push("SET FOREIGN_KEY_CHECKS = 0;");
  lines.push("");

  const seededProblemWhere = [
    "category_id = 0",
    "id BETWEEN 101 AND 130",
    `title IN (${allTitles.map(sql).join(", ")})`,
  ].join("\n       OR ");

  lines.push("DELETE FROM problem_companies");
  lines.push("WHERE problem_id IN (");
  lines.push("    SELECT id");
  lines.push("    FROM problems");
  lines.push(`    WHERE ${seededProblemWhere}`);
  lines.push(")");
  lines.push("   OR company_id IN (");
  lines.push("    SELECT id");
  lines.push("    FROM companies");
  lines.push(`    WHERE name IN (${companies.map(sql).join(", ")})`);
  lines.push(");");
  lines.push("");

  lines.push("DELETE FROM problem_tags");
  lines.push("WHERE problem_id IN (");
  lines.push("    SELECT id");
  lines.push("    FROM problems");
  lines.push(`    WHERE ${seededProblemWhere}`);
  lines.push(")");
  lines.push("   OR tag_id IN (");
  lines.push("    SELECT id");
  lines.push("    FROM tags");
  lines.push(`    WHERE name IN (${tags.map(sql).join(", ")})`);
  lines.push(");");
  lines.push("");

  for (const table of ["test_cases", "problem_templates", "problem_languages"]) {
    lines.push(`DELETE FROM ${table}`);
    lines.push("WHERE problem_id IN (");
    lines.push("    SELECT id");
    lines.push("    FROM problems");
    lines.push(`    WHERE ${seededProblemWhere}`);
    lines.push(");");
    lines.push("");
  }

  lines.push("DELETE FROM problems");
  lines.push(`WHERE ${seededProblemWhere};`);
  lines.push("");
  lines.push(`DELETE FROM companies WHERE name IN (${companies.map(sql).join(", ")});`);
  lines.push(`DELETE FROM tags WHERE name IN (${tags.map(sql).join(", ")});`);
  lines.push(
    `DELETE FROM problem_subcategories WHERE id BETWEEN 11 AND 27 OR subcategory_key IN (${subcategoryKeys.map(sql).join(", ")});`
  );
  lines.push(
    `DELETE FROM problem_categories WHERE id IN (${problemCategories.map((c) => c.id).join(", ")}) OR category_key IN (${categoryKeys.map(sql).join(", ")});`
  );
  lines.push("");
  lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  lines.push("");

  lines.push("INSERT INTO problem_categories (id, category_key, name, active) VALUES");
  lines.push(
    problemCategories
      .map((c, index) => `    (${c.id}, ${sql(c.key)}, ${sql(c.name)}, true)${index === problemCategories.length - 1 ? ";" : ","}`)
      .join("\n")
  );
  lines.push("");

  lines.push("INSERT INTO problem_subcategories (id, category_id, subcategory_key, name, active) VALUES");
  lines.push(
    problemSubcategories
      .map((s, index) => `    (${s.id}, ${s.categoryId}, ${sql(s.key)}, ${sql(s.name)}, true)${index === problemSubcategories.length - 1 ? ";" : ","}`)
      .join("\n")
  );
  lines.push("");

  lines.push("INSERT INTO tags (id, name) VALUES");
  lines.push(
    tags
      .map((tag, index) => `    (${index + 1}, ${sql(tag)})${index === tags.length - 1 ? ";" : ","}`)
      .join("\n")
  );
  lines.push("");

  lines.push("INSERT INTO companies (id, name) VALUES");
  lines.push(
    companies
      .map((company, index) => `    (${index + 1}, ${sql(company)})${index === companies.length - 1 ? ";" : ","}`)
      .join("\n")
  );
  lines.push("");

  lines.push("INSERT INTO problems (");
  lines.push("    id, title, statement, difficulty, tags, constraints, editorial, created_by, active,");
  lines.push("    time_limit_ms, memory_limit_mb, category_id, subcategory_id, created_at, updated_at");
  lines.push(") VALUES");
  lines.push(
    problems
      .map((p, index) => {
        return [
          "    (",
          `        ${p.id},`,
          `        ${sql(p.title)},`,
          `        ${sql(p.statement)},`,
          `        ${sql(p.difficulty)},`,
          `        ${sql(tagsCsv(p.tagNames.map((name) => name.replaceAll("-", " "))))},`,
          `        ${sql(p.constraints)},`,
          `        ${sql(p.editorial)},`,
          "        1,",
          "        true,",
          `        ${p.timeLimitMs},`,
          `        ${p.memoryLimitMb},`,
          `        ${p.categoryId},`,
          `        ${p.subcategoryId},`,
          "        CURRENT_TIMESTAMP,",
          `        CURRENT_TIMESTAMP`,
          `    )${index === problems.length - 1 ? ";" : ","}`,
        ].join("\n");
      })
      .join("\n")
  );
  lines.push("");

  const problemTags = [];
  const problemCompanies = [];
  const problemLanguages = [];
  const problemTemplates = [];
  const testCases = [];

  for (const problem of problems) {
    for (const tagName of problem.tagNames) {
      problemTags.push(`    (${problemTagId++}, ${problem.id}, ${tagMap.get(tagName)})`);
    }
    for (const companyName of problem.companyNames) {
      problemCompanies.push(`    (${problemCompanyId++}, ${problem.id}, ${companyMap.get(companyName)})`);
    }

    const templates = [
      ["java17", "Java 17", "java", makeJavaTemplate(problem)],
      ["python3", "Python 3", "python", makePythonTemplate(problem)],
      ["javascript", "JavaScript", "javascript", makeJsTemplate(problem)],
    ];

    for (const [languageKey, displayName, editorMode, starterCode] of templates) {
      problemLanguages.push(
        `    (${languageId}, ${problem.id}, ${sql(languageKey)}, ${sql(displayName)}, ${sql(editorMode)}, true)`
      );
      problemTemplates.push(
        `    (${templateId}, ${problem.id}, ${sql(languageKey)}, ${sql(starterCode)})`
      );
      languageId += 1;
      templateId += 1;
    }

    for (const testCase of problem.testCases) {
      testCases.push(
        `    (${testCaseId++}, ${problem.id}, ${sql(testCase.input)}, ${sql(testCase.output)}, ${testCase.sample ? "true" : "false"}, ${testCase.score}, ${problem.memoryLimitMb}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
    }
  }

  lines.push("INSERT INTO problem_tags (id, problem_id, tag_id) VALUES");
  lines.push(problemTags.map((row, index) => `${row}${index === problemTags.length - 1 ? ";" : ","}`).join("\n"));
  lines.push("");

  lines.push("INSERT INTO problem_companies (id, problem_id, company_id) VALUES");
  lines.push(problemCompanies.map((row, index) => `${row}${index === problemCompanies.length - 1 ? ";" : ","}`).join("\n"));
  lines.push("");

  lines.push("INSERT INTO problem_languages (id, problem_id, language_key, display_name, editor_mode, active) VALUES");
  lines.push(problemLanguages.map((row, index) => `${row}${index === problemLanguages.length - 1 ? ";" : ","}`).join("\n"));
  lines.push("");

  lines.push("INSERT INTO problem_templates (id, problem_id, language_key, starter_code) VALUES");
  lines.push(problemTemplates.map((row, index) => `${row}${index === problemTemplates.length - 1 ? ";" : ","}`).join("\n"));
  lines.push("");

  lines.push("INSERT INTO test_cases (id, problem_id, input, expected_output, is_sample, score, memory_limit_mb, active, created_at, updated_at) VALUES");
  lines.push(testCases.map((row, index) => `${row}${index === testCases.length - 1 ? ";" : ","}`).join("\n"));
  lines.push("");

  return lines.join("\n");
}

function buildQuizSql() {
  const ids = quizzes.map((quiz) => quiz.id);
  const titles = quizzes.map((quiz) => quiz.title);
  return [
    "DELETE FROM quizzes",
    `WHERE id IN (${ids.map(sql).join(", ")})`,
    `   OR title IN (${titles.map(sql).join(", ")});`,
    "",
    "INSERT INTO quizzes (id, title, description, duration_minutes, status, category, sub_category, difficulty, created_at) VALUES",
    quizzes
      .map(
        (quiz, index) =>
          `    (${sql(quiz.id)}, ${sql(quiz.title)}, ${sql(quiz.description)}, ${quiz.durationMinutes}, 'PUBLISHED', ${sql(
            quiz.category
          )}, ${sql(quiz.subCategory)}, ${sql(quiz.difficulty)}, CURRENT_TIMESTAMP)${
            index === quizzes.length - 1 ? ";" : ","
          }`
      )
      .join("\n"),
    "",
  ].join("\n");
}

function buildQuestionSql() {
  const questionRows = [];
  for (const quiz of quizzes) {
    for (const question of quiz.questions) {
      questionRows.push(
        `    (${sql(question.id)}, ${sql(quiz.id)}, ${sql(question.text)}, ${sql(question.options[0])}, ${sql(
          question.options[1]
        )}, ${sql(question.options[2])}, ${sql(question.options[3])}, ${sql(question.correct)})`
      );
    }
  }

  return [
    "DELETE FROM questions",
    `WHERE quiz_id IN (${quizzes.map((quiz) => sql(quiz.id)).join(", ")});`,
    "",
    "INSERT INTO questions (id, quiz_id, question_text, optiona, optionb, optionc, optiond, correct_option) VALUES",
    questionRows.map((row, index) => `${row}${index === questionRows.length - 1 ? ";" : ","}`).join("\n"),
    "",
  ].join("\n");
}

function buildStudyPlanSql() {
  const planRows = plans
    .map(
      (plan, index) =>
        `    (${sql(plan.slug)}, ${sql(plan.title)}, ${sql(plan.description)}, ${sql(plan.track)}, ${sql(
          plan.level
        )}, b'1', NOW(6), NOW(6))${index === plans.length - 1 ? "" : ","}`
    )
    .join("\n");

  const planItems = [];
  for (const plan of plans) {
    for (const item of plan.items) {
      planItems.push(
        [
          "SELECT",
          "    sp.id,",
          `    ${item.sequence},`,
          `    ${sql(item.title)},`,
          `    ${sql(item.description)},`,
          `    ${sql(item.itemType)},`,
          `    ${sql(item.referenceType)},`,
          `    ${sql(item.referenceId)},`,
          `    ${sql(item.referenceKey)},`,
          `    ${item.estimatedMinutes}`,
          "FROM study_plans sp",
          `WHERE sp.slug = ${sql(plan.slug)}`,
        ].join("\n")
      );
    }
  }

  return [
    "USE application_userdb;",
    "",
    "SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';",
    "",
    "INSERT INTO study_plans (",
    "    slug,",
    "    title,",
    "    description,",
    "    track,",
    "    level,",
    "    active,",
    "    created_at,",
    "    updated_at",
    ") VALUES",
    planRows,
    "ON DUPLICATE KEY UPDATE",
    "    title = VALUES(title),",
    "    description = VALUES(description),",
    "    track = VALUES(track),",
    "    level = VALUES(level),",
    "    active = VALUES(active),",
    "    updated_at = VALUES(updated_at);",
    "",
    "DELETE FROM user_study_plan_item_progress",
    "WHERE user_study_plan_id IN (",
    "    SELECT id",
    "    FROM user_study_plans",
    "    WHERE user_id = UUID_TO_BIN(@test_user_uuid)",
    ");",
    "",
    "DELETE FROM user_study_plans",
    "WHERE user_id = UUID_TO_BIN(@test_user_uuid);",
    "",
    "DELETE FROM study_plan_items",
    "WHERE study_plan_id IN (",
    "    SELECT id",
    "    FROM study_plans",
    `    WHERE slug IN (${plans.map((plan) => sql(plan.slug)).join(", ")})`,
    ");",
    "",
    "INSERT INTO study_plan_items (",
    "    study_plan_id,",
    "    sequence_number,",
    "    title,",
    "    description,",
    "    item_type,",
    "    reference_type,",
    "    reference_id,",
    "    reference_key,",
    "    estimated_minutes",
    ")",
    planItems.join("\nUNION ALL\n"),
    ";",
    "",
    "INSERT INTO user_study_plans (",
    "    user_id,",
    "    study_plan_id,",
    "    enrolled_at,",
    "    active,",
    "    completion_percentage",
    ")",
    "SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 12 DAY), b'1', 50.0",
    "FROM study_plans sp",
    "WHERE sp.slug = 'dsa-basics';",
    "",
    "INSERT INTO user_study_plans (",
    "    user_id,",
    "    study_plan_id,",
    "    enrolled_at,",
    "    active,",
    "    completion_percentage",
    ")",
    "SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 15 DAY), b'0', 25.0",
    "FROM study_plans sp",
    "WHERE sp.slug = 'backend-ops-foundations';",
    "",
    "INSERT INTO user_study_plans (",
    "    user_id,",
    "    study_plan_id,",
    "    enrolled_at,",
    "    active,",
    "    completion_percentage",
    ")",
    "SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 18 DAY), b'0', 100.0",
    "FROM study_plans sp",
    "WHERE sp.slug = 'frontend-mcq-revision';",
    "",
    "INSERT INTO user_study_plan_item_progress (",
    "    user_study_plan_id,",
    "    study_plan_item_id,",
    "    completed,",
    "    completed_at",
    ")",
    "SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 8 DAY)",
    "FROM user_study_plans usp",
    "JOIN study_plans sp ON sp.id = usp.study_plan_id",
    "JOIN study_plan_items spi ON spi.study_plan_id = sp.id",
    "WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)",
    "  AND sp.slug = 'dsa-basics'",
    "  AND spi.reference_key IN ('problem-101', 'quiz-12121212-1212-1212-1212-121212121212');",
    "",
    "INSERT INTO user_study_plan_item_progress (",
    "    user_study_plan_id,",
    "    study_plan_item_id,",
    "    completed,",
    "    completed_at",
    ")",
    "SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 5 DAY)",
    "FROM user_study_plans usp",
    "JOIN study_plans sp ON sp.id = usp.study_plan_id",
    "JOIN study_plan_items spi ON spi.study_plan_id = sp.id",
    "WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)",
    "  AND sp.slug = 'backend-ops-foundations'",
    "  AND spi.reference_key IN ('quiz-14141414-1414-1414-1414-141414141414');",
    "",
    "INSERT INTO user_study_plan_item_progress (",
    "    user_study_plan_id,",
    "    study_plan_item_id,",
    "    completed,",
    "    completed_at",
    ")",
    "SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 11 DAY)",
    "FROM user_study_plans usp",
    "JOIN study_plans sp ON sp.id = usp.study_plan_id",
    "JOIN study_plan_items spi ON spi.study_plan_id = sp.id",
    "WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)",
    "  AND sp.slug = 'frontend-mcq-revision';",
    "",
  ].join("\n");
}

await writeFile(path.join(root, "Backend/problemservice/src/main/resources/data.sql"), buildProblemSql(), "utf8");
await writeFile(path.join(root, "Backend/quiz-service/src/main/resources/data.sql"), buildQuizSql(), "utf8");
await writeFile(path.join(root, "Backend/question-service/src/main/resources/data.sql"), buildQuestionSql(), "utf8");
await writeFile(path.join(root, "sql-dumps/local/15-application_userdb-rich-study-plans.sql"), buildStudyPlanSql(), "utf8");

console.log("Generated richer local SaaS-style seed data.");
