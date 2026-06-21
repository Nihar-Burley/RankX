USE application_userdb;

SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';

INSERT INTO study_plans (
    slug,
    title,
    description,
    track,
    level,
    active,
    created_at,
    updated_at
) VALUES
    ('dsa-basics', 'DSA Basics', 'Start with core interview mechanics across arrays, search, and pattern recognition.', 'Coding', 'Beginner', b'1', NOW(6), NOW(6)),
    ('java-problem-solving', 'Java Problem Solving', 'Blend Java platform knowledge with high-signal coding exercises used in interviews.', 'Coding', 'Intermediate', b'1', NOW(6), NOW(6)),
    ('frontend-mcq-revision', 'Frontend MCQ Revision', 'Revise the modern frontend stack through a clean progression from markup to React state.', 'Frontend', 'Beginner', b'1', NOW(6), NOW(6)),
    ('sql-backend-quiz-track', 'SQL + Backend Quiz Track', 'Refresh backend and database concepts with a stronger service, persistence, and security arc.', 'Backend', 'Intermediate', b'1', NOW(6), NOW(6)),
    ('algorithms-pattern-ladder', 'Algorithms Pattern Ladder', 'Climb through sliding windows, prefix products, graph traversal, and set-based reasoning.', 'Coding', 'Advanced', b'1', NOW(6), NOW(6)),
    ('mixed-interview-prep', 'Mixed Interview Prep', 'Blend coding drills and architecture quizzes for broad interview readiness.', 'Interview', 'Advanced', b'1', NOW(6), NOW(6)),
    ('graph-and-matrix-journey', 'Graph and Matrix Journey', 'Move from BFS fundamentals into graph cycles, ocean reachability, and traversal confidence.', 'Coding', 'Intermediate', b'1', NOW(6), NOW(6)),
    ('linked-list-and-cache-track', 'Linked List and Cache Track', 'Combine classic pointer problems with foundational cache design and ranked merging.', 'Coding', 'Intermediate', b'1', NOW(6), NOW(6)),
    ('backend-ops-foundations', 'Backend Ops Foundations', 'Strengthen API, container, cache, and observability instincts for production-facing services.', 'Backend', 'Intermediate', b'1', NOW(6), NOW(6)),
    ('algorithmic-interview-sprint', 'Algorithmic Interview Sprint', 'Run a sharper interview lap through grouping, frequency, DP, and greedy reachability.', 'Interview', 'Advanced', b'1', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    track = VALUES(track),
    level = VALUES(level),
    active = VALUES(active),
    updated_at = VALUES(updated_at);

DELETE FROM user_study_plan_item_progress
WHERE user_study_plan_id IN (
    SELECT id
    FROM user_study_plans
    WHERE user_id = UUID_TO_BIN(@test_user_uuid)
);

DELETE FROM user_study_plans
WHERE user_id = UUID_TO_BIN(@test_user_uuid);

DELETE FROM study_plan_items
WHERE study_plan_id IN (
    SELECT id
    FROM study_plans
    WHERE slug IN ('dsa-basics', 'java-problem-solving', 'frontend-mcq-revision', 'sql-backend-quiz-track', 'algorithms-pattern-ladder', 'mixed-interview-prep', 'graph-and-matrix-journey', 'linked-list-and-cache-track', 'backend-ops-foundations', 'algorithmic-interview-sprint')
);

INSERT INTO study_plan_items (
    study_plan_id,
    sequence_number,
    title,
    description,
    item_type,
    reference_type,
    reference_id,
    reference_key,
    estimated_minutes
)
SELECT
    sp.id,
    1,
    'Arrays warmup',
    'Solve an introductory array lookup problem.',
    'CODING_PROBLEM',
    'problem',
    '101',
    'problem-101',
    20
FROM study_plans sp
WHERE sp.slug = 'dsa-basics'
UNION ALL
SELECT
    sp.id,
    2,
    'Pattern checkpoint',
    'Recognize core algorithmic patterns before coding deeper.',
    'QUIZ',
    'quiz',
    '12121212-1212-1212-1212-121212121212',
    'quiz-12121212-1212-1212-1212-121212121212',
    18
FROM study_plans sp
WHERE sp.slug = 'dsa-basics'
UNION ALL
SELECT
    sp.id,
    3,
    'Profit window drill',
    'Practice reasoning about local minima and maxima.',
    'CODING_PROBLEM',
    'problem',
    '103',
    'problem-103',
    20
FROM study_plans sp
WHERE sp.slug = 'dsa-basics'
UNION ALL
SELECT
    sp.id,
    4,
    'Binary search confidence',
    'Lock in the classic sorted-search workflow.',
    'CODING_PROBLEM',
    'problem',
    '105',
    'problem-105',
    25
FROM study_plans sp
WHERE sp.slug = 'dsa-basics'
UNION ALL
SELECT
    sp.id,
    1,
    'Anagram frequency map',
    'Use counting structures cleanly and efficiently.',
    'CODING_PROBLEM',
    'problem',
    '102',
    'problem-102',
    20
FROM study_plans sp
WHERE sp.slug = 'java-problem-solving'
UNION ALL
SELECT
    sp.id,
    2,
    'Java platform checkpoint',
    'Review OOP, collections, and API selection tradeoffs.',
    'QUIZ',
    'quiz',
    '55555555-5555-5555-5555-555555555555',
    'quiz-55555555-5555-5555-5555-555555555555',
    18
FROM study_plans sp
WHERE sp.slug = 'java-problem-solving'
UNION ALL
SELECT
    sp.id,
    3,
    'Heap-based ranking',
    'Use comparator-backed collections for ranked results.',
    'CODING_PROBLEM',
    'problem',
    '108',
    'problem-108',
    30
FROM study_plans sp
WHERE sp.slug = 'java-problem-solving'
UNION ALL
SELECT
    sp.id,
    4,
    'DP translation drill',
    'Turn a recurrence into an iterative Java solution.',
    'CODING_PROBLEM',
    'problem',
    '112',
    'problem-112',
    35
FROM study_plans sp
WHERE sp.slug = 'java-problem-solving'
UNION ALL
SELECT
    sp.id,
    1,
    'HTML and semantics',
    'Quick MCQ revision on semantic HTML.',
    'QUIZ',
    'quiz',
    '11111111-1111-1111-1111-111111111111',
    'quiz-11111111-1111-1111-1111-111111111111',
    15
FROM study_plans sp
WHERE sp.slug = 'frontend-mcq-revision'
UNION ALL
SELECT
    sp.id,
    2,
    'CSS layouts',
    'Review flexbox and grid concepts.',
    'QUIZ',
    'quiz',
    '22222222-2222-2222-2222-222222222222',
    'quiz-22222222-2222-2222-2222-222222222222',
    15
FROM study_plans sp
WHERE sp.slug = 'frontend-mcq-revision'
UNION ALL
SELECT
    sp.id,
    3,
    'JavaScript basics',
    'Strengthen core JS concept recall.',
    'QUIZ',
    'quiz',
    '33333333-3333-3333-3333-333333333333',
    'quiz-33333333-3333-3333-3333-333333333333',
    20
FROM study_plans sp
WHERE sp.slug = 'frontend-mcq-revision'
UNION ALL
SELECT
    sp.id,
    4,
    'React state and hooks',
    'Connect browser fundamentals to component architecture.',
    'QUIZ',
    'quiz',
    '77777777-7777-7777-7777-777777777777',
    'quiz-77777777-7777-7777-7777-777777777777',
    20
FROM study_plans sp
WHERE sp.slug = 'frontend-mcq-revision'
UNION ALL
SELECT
    sp.id,
    1,
    'SQL joins and indexing',
    'Revise query optimization basics.',
    'QUIZ',
    'quiz',
    '44444444-4444-4444-4444-444444444444',
    'quiz-44444444-4444-4444-4444-444444444444',
    20
FROM study_plans sp
WHERE sp.slug = 'sql-backend-quiz-track'
UNION ALL
SELECT
    sp.id,
    2,
    'Spring data and APIs',
    'Review controller, service, JPA, and transaction design.',
    'QUIZ',
    'quiz',
    '88888888-8888-8888-8888-888888888888',
    'quiz-88888888-8888-8888-8888-888888888888',
    20
FROM study_plans sp
WHERE sp.slug = 'sql-backend-quiz-track'
UNION ALL
SELECT
    sp.id,
    3,
    'Backend API security',
    'Cover auth, secrets, and operational safety basics.',
    'QUIZ',
    'quiz',
    '99999999-9999-9999-9999-999999999999',
    'quiz-99999999-9999-9999-9999-999999999999',
    18
FROM study_plans sp
WHERE sp.slug = 'sql-backend-quiz-track'
UNION ALL
SELECT
    sp.id,
    4,
    'System design grounding',
    'Tie the backend pieces together with systems thinking.',
    'QUIZ',
    'quiz',
    '66666666-6666-6666-6666-666666666666',
    'quiz-66666666-6666-6666-6666-666666666666',
    22
FROM study_plans sp
WHERE sp.slug = 'sql-backend-quiz-track'
UNION ALL
SELECT
    sp.id,
    1,
    'Sliding window mastery',
    'Practice maintaining a dynamic unique window.',
    'CODING_PROBLEM',
    'problem',
    '107',
    'problem-107',
    30
FROM study_plans sp
WHERE sp.slug = 'algorithms-pattern-ladder'
UNION ALL
SELECT
    sp.id,
    2,
    'Prefix product reasoning',
    'Use left and right passes without division.',
    'CODING_PROBLEM',
    'problem',
    '109',
    'problem-109',
    30
FROM study_plans sp
WHERE sp.slug = 'algorithms-pattern-ladder'
UNION ALL
SELECT
    sp.id,
    3,
    'Grid traversal systems',
    'Apply graph traversal cleanly on matrix input.',
    'CODING_PROBLEM',
    'problem',
    '110',
    'problem-110',
    35
FROM study_plans sp
WHERE sp.slug = 'algorithms-pattern-ladder'
UNION ALL
SELECT
    sp.id,
    4,
    'Hash-set sequence scan',
    'Spot the optimal O(n) boundary detection pattern.',
    'CODING_PROBLEM',
    'problem',
    '111',
    'problem-111',
    25
FROM study_plans sp
WHERE sp.slug = 'algorithms-pattern-ladder'
UNION ALL
SELECT
    sp.id,
    1,
    'Stack validity check',
    'Move quickly from symbols to stack invariants.',
    'CODING_PROBLEM',
    'problem',
    '104',
    'problem-104',
    20
FROM study_plans sp
WHERE sp.slug = 'mixed-interview-prep'
UNION ALL
SELECT
    sp.id,
    2,
    'Pattern selection quiz',
    'Choose the best algorithm family before implementation.',
    'QUIZ',
    'quiz',
    '12121212-1212-1212-1212-121212121212',
    'quiz-12121212-1212-1212-1212-121212121212',
    20
FROM study_plans sp
WHERE sp.slug = 'mixed-interview-prep'
UNION ALL
SELECT
    sp.id,
    3,
    'Intervals under pressure',
    'Sort first, then merge with confidence.',
    'CODING_PROBLEM',
    'problem',
    '106',
    'problem-106',
    30
FROM study_plans sp
WHERE sp.slug = 'mixed-interview-prep'
UNION ALL
SELECT
    sp.id,
    4,
    'System design concepts quiz',
    'Review scaling and distributed systems tradeoffs.',
    'QUIZ',
    'quiz',
    '66666666-6666-6666-6666-666666666666',
    'quiz-66666666-6666-6666-6666-666666666666',
    22
FROM study_plans sp
WHERE sp.slug = 'mixed-interview-prep'
UNION ALL
SELECT
    sp.id,
    1,
    'Rotting oranges clock',
    'Use layer-by-layer BFS on a changing matrix.',
    'CODING_PROBLEM',
    'problem',
    '121',
    'problem-121',
    25
FROM study_plans sp
WHERE sp.slug = 'graph-and-matrix-journey'
UNION ALL
SELECT
    sp.id,
    2,
    'Graph traversal refresher',
    'Review BFS, DFS, and visited-state tradeoffs.',
    'QUIZ',
    'quiz',
    '20202020-2020-2020-2020-202020202020',
    'quiz-20202020-2020-2020-2020-202020202020',
    18
FROM study_plans sp
WHERE sp.slug = 'graph-and-matrix-journey'
UNION ALL
SELECT
    sp.id,
    3,
    'Course dependency check',
    'Reason about cycles before planning execution.',
    'CODING_PROBLEM',
    'problem',
    '120',
    'problem-120',
    30
FROM study_plans sp
WHERE sp.slug = 'graph-and-matrix-journey'
UNION ALL
SELECT
    sp.id,
    4,
    'Ocean reachability',
    'Reverse the water-flow perspective and mark reachable cells.',
    'CODING_PROBLEM',
    'problem',
    '122',
    'problem-122',
    35
FROM study_plans sp
WHERE sp.slug = 'graph-and-matrix-journey'
UNION ALL
SELECT
    sp.id,
    1,
    'Reverse the baseline list',
    'Build pointer confidence with a clean iterative reverse.',
    'CODING_PROBLEM',
    'problem',
    '125',
    'problem-125',
    20
FROM study_plans sp
WHERE sp.slug = 'linked-list-and-cache-track'
UNION ALL
SELECT
    sp.id,
    2,
    'Reorder linked flow',
    'Split, reverse, and weave a list back together.',
    'CODING_PROBLEM',
    'problem',
    '126',
    'problem-126',
    30
FROM study_plans sp
WHERE sp.slug = 'linked-list-and-cache-track'
UNION ALL
SELECT
    sp.id,
    3,
    'Design an LRU cache',
    'Model O(1) lookup plus recency ordering.',
    'CODING_PROBLEM',
    'problem',
    '123',
    'problem-123',
    35
FROM study_plans sp
WHERE sp.slug = 'linked-list-and-cache-track'
UNION ALL
SELECT
    sp.id,
    4,
    'Merge many sorted lists',
    'Use a heap to keep the next smallest node visible.',
    'CODING_PROBLEM',
    'problem',
    '124',
    'problem-124',
    35
FROM study_plans sp
WHERE sp.slug = 'linked-list-and-cache-track'
UNION ALL
SELECT
    sp.id,
    1,
    'REST API shape',
    'Choose better resource, status, and validation patterns.',
    'QUIZ',
    'quiz',
    '14141414-1414-1414-1414-141414141414',
    'quiz-14141414-1414-1414-1414-141414141414',
    18
FROM study_plans sp
WHERE sp.slug = 'backend-ops-foundations'
UNION ALL
SELECT
    sp.id,
    2,
    'Docker runtime thinking',
    'Understand image layering and runtime config separation.',
    'QUIZ',
    'quiz',
    '15151515-1515-1515-1515-151515151515',
    'quiz-15151515-1515-1515-1515-151515151515',
    16
FROM study_plans sp
WHERE sp.slug = 'backend-ops-foundations'
UNION ALL
SELECT
    sp.id,
    3,
    'Redis and sessions',
    'Use cache and session primitives with better operational judgment.',
    'QUIZ',
    'quiz',
    '16161616-1616-1616-1616-161616161616',
    'quiz-16161616-1616-1616-1616-161616161616',
    16
FROM study_plans sp
WHERE sp.slug = 'backend-ops-foundations'
UNION ALL
SELECT
    sp.id,
    4,
    'Observability signals',
    'Read health, metrics, logs, and traces as one operating loop.',
    'QUIZ',
    'quiz',
    '23232323-2323-2323-2323-232323232323',
    'quiz-23232323-2323-2323-2323-232323232323',
    18
FROM study_plans sp
WHERE sp.slug = 'backend-ops-foundations'
UNION ALL
SELECT
    sp.id,
    1,
    'Group related strings',
    'Recognize signature-based grouping quickly.',
    'CODING_PROBLEM',
    'problem',
    '116',
    'problem-116',
    25
FROM study_plans sp
WHERE sp.slug = 'algorithmic-interview-sprint'
UNION ALL
SELECT
    sp.id,
    2,
    'Top frequent extraction',
    'Move from counts to ranked results efficiently.',
    'CODING_PROBLEM',
    'problem',
    '113',
    'problem-113',
    25
FROM study_plans sp
WHERE sp.slug = 'algorithmic-interview-sprint'
UNION ALL
SELECT
    sp.id,
    3,
    'Dynamic programming basics',
    'Check whether states and transitions feel obvious yet.',
    'QUIZ',
    'quiz',
    '19191919-1919-1919-1919-191919191919',
    'quiz-19191919-1919-1919-1919-191919191919',
    18
FROM study_plans sp
WHERE sp.slug = 'algorithmic-interview-sprint'
UNION ALL
SELECT
    sp.id,
    4,
    'House and jump decisions',
    'Switch between DP and greedy reasoning under pressure.',
    'CODING_PROBLEM',
    'problem',
    '128',
    'problem-128',
    25
FROM study_plans sp
WHERE sp.slug = 'algorithmic-interview-sprint'
;

INSERT INTO user_study_plans (
    user_id,
    study_plan_id,
    enrolled_at,
    active,
    completion_percentage
)
SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 12 DAY), b'1', 50.0
FROM study_plans sp
WHERE sp.slug = 'dsa-basics';

INSERT INTO user_study_plans (
    user_id,
    study_plan_id,
    enrolled_at,
    active,
    completion_percentage
)
SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 15 DAY), b'0', 25.0
FROM study_plans sp
WHERE sp.slug = 'backend-ops-foundations';

INSERT INTO user_study_plans (
    user_id,
    study_plan_id,
    enrolled_at,
    active,
    completion_percentage
)
SELECT UUID_TO_BIN(@test_user_uuid), sp.id, DATE_SUB(NOW(), INTERVAL 18 DAY), b'0', 100.0
FROM study_plans sp
WHERE sp.slug = 'frontend-mcq-revision';

INSERT INTO user_study_plan_item_progress (
    user_study_plan_id,
    study_plan_item_id,
    completed,
    completed_at
)
SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 8 DAY)
FROM user_study_plans usp
JOIN study_plans sp ON sp.id = usp.study_plan_id
JOIN study_plan_items spi ON spi.study_plan_id = sp.id
WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)
  AND sp.slug = 'dsa-basics'
  AND spi.reference_key IN ('problem-101', 'quiz-12121212-1212-1212-1212-121212121212');

INSERT INTO user_study_plan_item_progress (
    user_study_plan_id,
    study_plan_item_id,
    completed,
    completed_at
)
SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM user_study_plans usp
JOIN study_plans sp ON sp.id = usp.study_plan_id
JOIN study_plan_items spi ON spi.study_plan_id = sp.id
WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)
  AND sp.slug = 'backend-ops-foundations'
  AND spi.reference_key IN ('quiz-14141414-1414-1414-1414-141414141414');

INSERT INTO user_study_plan_item_progress (
    user_study_plan_id,
    study_plan_item_id,
    completed,
    completed_at
)
SELECT usp.id, spi.id, b'1', DATE_SUB(NOW(), INTERVAL 11 DAY)
FROM user_study_plans usp
JOIN study_plans sp ON sp.id = usp.study_plan_id
JOIN study_plan_items spi ON spi.study_plan_id = sp.id
WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)
  AND sp.slug = 'frontend-mcq-revision';
