USE application_submission_db;

SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';

DELETE FROM submissions
WHERE user_id = UUID_TO_BIN(@test_user_uuid)
   OR id IN (1001, 1002, 1003);

INSERT INTO submissions (
    id,
    user_id,
    problem_id,
    language_key,
    source_code,
    status,
    runtime_ms,
    memory_kb,
    created_at
) VALUES
    (
        1001,
        UUID_TO_BIN(@test_user_uuid),
        101,
        'java17',
        'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        java.util.Map<Integer, Integer> seen = new java.util.HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) {\n                return new int[]{seen.get(complement), i};\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}',
        'ACCEPTED',
        12,
        18624,
        DATE_SUB(NOW(), INTERVAL 7 DAY)
    ),
    (
        1002,
        UUID_TO_BIN(@test_user_uuid),
        103,
        'python3',
        'class Solution:\n    def maxProfit(self, prices):\n        min_price = prices[0]\n        best = 0\n        for price in prices:\n            best = max(best, price - min_price)\n            min_price = min(min_price, price)\n        return best - 1\n',
        'WRONG_ANSWER',
        19,
        15432,
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        1003,
        UUID_TO_BIN(@test_user_uuid),
        105,
        'javascript',
        'function search(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\nmodule.exports = search;\n',
        'ACCEPTED',
        8,
        14912,
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );
