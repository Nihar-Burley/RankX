USE application_attempt_db;

SET @test_user_uuid = '00000000-0000-0000-0000-000000000102';
SET @attempt_java_uuid = '70000000-0000-0000-0000-000000000001';
SET @attempt_sql_uuid = '70000000-0000-0000-0000-000000000002';

DELETE FROM answers
WHERE attempt_id IN (
    UUID_TO_BIN(@attempt_java_uuid),
    UUID_TO_BIN(@attempt_sql_uuid)
);

DELETE FROM attempts
WHERE id IN (
    UUID_TO_BIN(@attempt_java_uuid),
    UUID_TO_BIN(@attempt_sql_uuid)
)
   OR user_id = UUID_TO_BIN(@test_user_uuid);

INSERT INTO attempts (
    id,
    user_id,
    quiz_id,
    status,
    started_at,
    submitted_at
) VALUES
    (
        UUID_TO_BIN(@attempt_java_uuid),
        UUID_TO_BIN(@test_user_uuid),
        UUID_TO_BIN('55555555-5555-5555-5555-555555555555'),
        'SUBMITTED',
        DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 18 MINUTE,
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        UUID_TO_BIN(@attempt_sql_uuid),
        UUID_TO_BIN(@test_user_uuid),
        UUID_TO_BIN('44444444-4444-4444-4444-444444444444'),
        'SUBMITTED',
        DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 14 MINUTE,
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    );

INSERT INTO answers (
    id,
    question_id,
    selected_option,
    attempt_id
) VALUES
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000001'),
        UUID_TO_BIN('e5555555-5555-5555-5555-555555555551'),
        'C',
        UUID_TO_BIN(@attempt_java_uuid)
    ),
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000002'),
        UUID_TO_BIN('e5555555-5555-5555-5555-555555555552'),
        'B',
        UUID_TO_BIN(@attempt_java_uuid)
    ),
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000003'),
        UUID_TO_BIN('e5555555-5555-5555-5555-555555555553'),
        'A',
        UUID_TO_BIN(@attempt_java_uuid)
    ),
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000004'),
        UUID_TO_BIN('d4444444-4444-4444-4444-444444444441'),
        'C',
        UUID_TO_BIN(@attempt_sql_uuid)
    ),
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000005'),
        UUID_TO_BIN('d4444444-4444-4444-4444-444444444442'),
        'A',
        UUID_TO_BIN(@attempt_sql_uuid)
    ),
    (
        UUID_TO_BIN('72000000-0000-0000-0000-000000000006'),
        UUID_TO_BIN('d4444444-4444-4444-4444-444444444443'),
        'B',
        UUID_TO_BIN(@attempt_sql_uuid)
    );
