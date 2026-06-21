USE application_userdb;

SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';

DELETE FROM product_events
WHERE user_id = UUID_TO_BIN(@test_user_uuid);

DELETE FROM user_study_plan_item_progress
WHERE user_study_plan_id IN (
    SELECT id
    FROM user_study_plans
    WHERE user_id = UUID_TO_BIN(@test_user_uuid)
);

DELETE FROM user_study_plans
WHERE user_id = UUID_TO_BIN(@test_user_uuid);

DELETE FROM user_streaks
WHERE user_id = UUID_TO_BIN(@test_user_uuid);

DELETE FROM user_preferences
WHERE user_id = UUID_TO_BIN(@test_user_uuid);

INSERT INTO user_preferences (
    user_id,
    goal,
    preferred_track,
    skill_level,
    onboarding_completed,
    created_at,
    updated_at
) VALUES (
    UUID_TO_BIN(@test_user_uuid),
    'Prepare for backend and data-structures interviews with a steady practice cadence.',
    'backend',
    'intermediate',
    b'1',
    DATE_SUB(NOW(), INTERVAL 14 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

INSERT INTO user_streaks (
    user_id,
    current_streak,
    longest_streak,
    last_activity_date
) VALUES (
    UUID_TO_BIN(@test_user_uuid),
    5,
    11,
    CURRENT_DATE
);

INSERT INTO user_study_plans (
    user_id,
    study_plan_id,
    enrolled_at,
    active,
    completion_percentage
)
SELECT
    UUID_TO_BIN(@test_user_uuid),
    sp.id,
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    b'1',
    50.0
FROM study_plans sp
WHERE sp.slug = 'dsa-basics';

INSERT INTO user_study_plan_item_progress (
    user_study_plan_id,
    study_plan_item_id,
    completed,
    completed_at
)
SELECT
    usp.id,
    spi.id,
    b'1',
    DATE_SUB(NOW(), INTERVAL 8 DAY)
FROM user_study_plans usp
JOIN study_plans sp
    ON sp.id = usp.study_plan_id
JOIN study_plan_items spi
    ON spi.study_plan_id = sp.id
WHERE usp.user_id = UUID_TO_BIN(@test_user_uuid)
  AND sp.slug = 'dsa-basics'
  AND spi.reference_key = 'problem-101';

INSERT INTO product_events (
    event_name,
    event_category,
    source,
    track,
    user_id,
    role,
    content_type,
    content_id,
    content_title,
    parent_content_id,
    topic,
    outcome,
    numeric_value,
    metadata_json,
    occurred_at,
    recorded_at
) VALUES
    (
        'onboarding_completed',
        'activation',
        'onboarding',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'profile',
        'preference-backend',
        'Backend preference setup',
        NULL,
        'career-growth',
        'completed',
        1,
        '{"goal":"backend-interviews","skillLevel":"intermediate"}',
        DATE_SUB(NOW(), INTERVAL 14 DAY),
        DATE_SUB(NOW(), INTERVAL 14 DAY)
    ),
    (
        'study_plan_enrolled',
        'engagement',
        'dashboard',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'study_plan',
        'dsa-basics',
        'DSA Basics',
        NULL,
        'arrays',
        'started',
        1,
        '{"planSlug":"dsa-basics"}',
        DATE_SUB(NOW(), INTERVAL 12 DAY),
        DATE_SUB(NOW(), INTERVAL 12 DAY)
    ),
    (
        'problem_opened',
        'coding',
        'study-plan',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'problem',
        'problem-101',
        'Two Sum',
        'dsa-basics',
        'arrays',
        'viewed',
        1,
        '{"difficulty":"easy"}',
        DATE_SUB(NOW(), INTERVAL 8 DAY),
        DATE_SUB(NOW(), INTERVAL 8 DAY)
    ),
    (
        'submission_completed',
        'coding',
        'editor',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'problem',
        'problem-101',
        'Two Sum',
        'dsa-basics',
        'arrays',
        'accepted',
        1001,
        '{"language":"java17","runtimeMs":12}',
        DATE_SUB(NOW(), INTERVAL 7 DAY),
        DATE_SUB(NOW(), INTERVAL 7 DAY)
    ),
    (
        'submission_completed',
        'coding',
        'editor',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'problem',
        'problem-103',
        'Best Time to Buy and Sell Stock',
        'dsa-basics',
        'arrays',
        'wrong_answer',
        1002,
        '{"language":"python3","runtimeMs":19}',
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        'quiz_attempt_submitted',
        'quiz',
        'practice',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'quiz',
        '55555555-5555-5555-5555-555555555555',
        'Java OOP and Collections',
        NULL,
        'java',
        'submitted',
        66.67,
        '{"attemptId":"70000000-0000-0000-0000-000000000001"}',
        DATE_SUB(NOW(), INTERVAL 4 DAY),
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        'quiz_attempt_submitted',
        'quiz',
        'practice',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'quiz',
        '44444444-4444-4444-4444-444444444444',
        'SQL Joins and Indexing',
        NULL,
        'sql',
        'submitted',
        100.0,
        '{"attemptId":"70000000-0000-0000-0000-000000000002"}',
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        'dashboard_opened',
        'engagement',
        'dashboard',
        'backend',
        UUID_TO_BIN(@test_user_uuid),
        'ROLE_USER',
        'dashboard',
        'home',
        'Home Dashboard',
        NULL,
        'momentum',
        'active',
        1,
        '{"surface":"home"}',
        DATE_SUB(NOW(), INTERVAL 1 DAY),
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );
