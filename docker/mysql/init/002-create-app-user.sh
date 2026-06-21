#!/bin/sh
set -eu

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<EOSQL
CREATE USER IF NOT EXISTS '${MYSQL_APP_USER}'@'%' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON application_auth_db.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_userdb.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_problemdb.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_question_db.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_quiz_db.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_attempt_db.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_result_db.* TO '${MYSQL_APP_USER}'@'%';
GRANT ALL PRIVILEGES ON application_submission_db.* TO '${MYSQL_APP_USER}'@'%';
FLUSH PRIVILEGES;
EOSQL
