package com.rankx.common.swagger.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(SwaggerProperties.class)
@ConditionalOnProperty(
        prefix = "rankx.swagger",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class SwaggerConfiguration {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    private final SwaggerProperties properties;

    @Bean
    public OpenAPI rankxOpenAPI() {

        return new OpenAPI()

                .info(new Info()

                        .title(properties.getTitle())

                        .description(properties.getDescription())

                        .version(properties.getVersion())

                        .contact(new Contact()

                                .name(properties.getContactName())

                                .email(properties.getContactEmail())

                                .url(properties.getContactUrl())
                        )

                        .license(new License()

                                .name(properties.getLicenseName())

                                .url(properties.getLicenseUrl())
                        )
                )

                .externalDocs(new ExternalDocumentation()

                        .description("RankX Documentation")

                        .url(properties.getDocumentation())
                )

                .addSecurityItem(

                        new SecurityRequirement()

                                .addList(SECURITY_SCHEME_NAME)
                )

                .schemaRequirement(

                        SECURITY_SCHEME_NAME,

                        new SecurityScheme()

                                .name(SECURITY_SCHEME_NAME)

                                .type(SecurityScheme.Type.HTTP)

                                .scheme("bearer")

                                .bearerFormat("JWT")
                );
    }

    /**
     * Public APIs
     */
    @Bean
    public GroupedOpenApi publicApi() {

        return GroupedOpenApi.builder()

                .group("Public APIs")

                .pathsToMatch("/api/public/**")

                .build();
    }

    /**
     * Admin APIs
     */
    @Bean
    public GroupedOpenApi adminApi() {

        return GroupedOpenApi.builder()

                .group("Admin APIs")

                .pathsToMatch("/api/admin/**")

                .build();
    }

    /**
     * Internal APIs
     */
    @Bean
    public GroupedOpenApi internalApi() {

        return GroupedOpenApi.builder()

                .group("Internal APIs")

                .pathsToMatch("/api/internal/**")

                .build();
    }

}