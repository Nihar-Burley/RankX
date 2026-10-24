package com.rankx.common.swagger.constant;

/**
 * Common Swagger/OpenAPI constants used across RankX microservices.
 *
 * @author RankX
 * @since 1.0.0
 */
public final class SwaggerConstants {

    private SwaggerConstants() {
        throw new IllegalStateException("Utility class");
    }

    /*
     * ============================================================
     * Security
     * ============================================================
     */

    public static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    public static final String SECURITY_SCHEME = "bearer";

    public static final String SECURITY_TYPE = "JWT";

    public static final String AUTHORIZATION_HEADER = "Authorization";

    public static final String BEARER_PREFIX = "Bearer ";

    /*
     * ============================================================
     * Groups
     * ============================================================
     */

    public static final String PUBLIC_GROUP = "Public APIs";

    public static final String ADMIN_GROUP = "Admin APIs";

    public static final String INTERNAL_GROUP = "Internal APIs";

    /*
     * ============================================================
     * API Paths
     * ============================================================
     */

    public static final String PUBLIC_PATH = "/api/public/**";

    public static final String ADMIN_PATH = "/api/admin/**";

    public static final String INTERNAL_PATH = "/api/internal/**";

    /*
     * ============================================================
     * Default Information
     * ============================================================
     */

    public static final String DEFAULT_TITLE = "RankX API";

    public static final String DEFAULT_DESCRIPTION =
            "REST APIs for RankX Platform";

    public static final String DEFAULT_VERSION = "v1";

    /*
     * ============================================================
     * Contact
     * ============================================================
     */

    public static final String DEFAULT_CONTACT_NAME = "RankX Team";

    public static final String DEFAULT_CONTACT_EMAIL =
            "support@rankx.com";

    public static final String DEFAULT_CONTACT_URL =
            "https://rankx.com";

    /*
     * ============================================================
     * License
     * ============================================================
     */

    public static final String DEFAULT_LICENSE_NAME =
            "Apache License 2.0";

    public static final String DEFAULT_LICENSE_URL =
            "https://www.apache.org/licenses/LICENSE-2.0";

    /*
     * ============================================================
     * Documentation
     * ============================================================
     */

    public static final String DOCUMENTATION_DESCRIPTION =
            "RankX API Documentation";

    public static final String DEFAULT_DOCUMENTATION_URL =
            "https://docs.rankx.com";

    /*
     * ============================================================
     * Response Codes
     * ============================================================
     */

    public static final String HTTP_200 = "200";

    public static final String HTTP_201 = "201";

    public static final String HTTP_204 = "204";

    public static final String HTTP_400 = "400";

    public static final String HTTP_401 = "401";

    public static final String HTTP_403 = "403";

    public static final String HTTP_404 = "404";

    public static final String HTTP_409 = "409";

    public static final String HTTP_422 = "422";

    public static final String HTTP_500 = "500";

    /*
     * ============================================================
     * Response Messages
     * ============================================================
     */

    public static final String SUCCESS = "Success";

    public static final String CREATED = "Created";

    public static final String NO_CONTENT = "No Content";

    public static final String BAD_REQUEST = "Bad Request";

    public static final String UNAUTHORIZED = "Unauthorized";

    public static final String FORBIDDEN = "Forbidden";

    public static final String NOT_FOUND = "Resource Not Found";

    public static final String CONFLICT = "Conflict";

    public static final String VALIDATION_FAILED = "Validation Failed";

    public static final String INTERNAL_SERVER_ERROR =
            "Internal Server Error";

}