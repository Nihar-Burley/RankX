package com.rankx.common.swagger.config;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "rankx.swagger")
public class SwaggerProperties {

    /**
     * Enable/Disable Swagger.
     */
    private boolean enabled = true;

    /**
     * API Title
     */
    private String title = "RankX API";

    /**
     * API Description
     */
    private String description = "REST APIs for RankX Platform";

    /**
     * API Version
     */
    private String version = "v1";

    /**
     * Contact Information
     */
    private String contactName = "RankX Team";

    private String contactEmail = "support@rankx.com";

    private String contactUrl = "https://rankx.com";

    /**
     * License
     */
    private String licenseName = "Apache License 2.0";

    private String licenseUrl = "https://www.apache.org/licenses/LICENSE-2.0";

    /**
     * External Documentation
     */
    private String documentation = "https://docs.rankx.com";

}