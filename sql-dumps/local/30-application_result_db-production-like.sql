USE application_result_db;

SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';
SET @attempt_java_uuid = '70000000-0000-0000-0000-000000000001';
SET @attempt_sql_uuid = '70000000-0000-0000-0000-000000000002';

DELETE FROM results
WHERE attempt_id IN (
    UUID_TO_BIN(@attempt_java_uuid),
    UUID_TO_BIN(@attempt_sql_uuid)
)
   OR user_id = UUID_TO_BIN(@test_user_uuid);

INSERT INTO results (
    id,
    attempt_id,
    user_id,
    quiz_id,
    score,
    total_questions,
    percentage,
    evaluated_at
) VALUES
    (
        UUID_TO_BIN('71000000-0000-0000-0000-000000000001'),
        UUID_TO_BIN(@attempt_java_uuid),
        UUID_TO_BIN(@test_user_uuid),
        UUID_TO_BIN('55555555-5555-5555-5555-555555555555'),
        2,
        3,
        66.67,
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        UUID_TO_BIN('71000000-0000-0000-0000-000000000002'),
        UUID_TO_BIN(@attempt_sql_uuid),
        UUID_TO_BIN(@test_user_uuid),
        UUID_TO_BIN('44444444-4444-4444-4444-444444444444'),
        3,
        3,
        100.0,
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    );
