package com.rankx.common.swagger.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "ApiErrorResponse",
        description = "Standard error response returned by RankX APIs."
)
public class ApiErrorResponse {

    @Schema(
            description = "Time at which the error occurred.",
            example = "2026-07-18T14:22:18"
    )
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime timestamp;

    @Schema(
            description = "HTTP status code.",
            example = "404"
    )
    private Integer status;

    @Schema(
            description = "HTTP error.",
            example = "NOT_FOUND"
    )
    private String error;

    @Schema(
            description = "Detailed error message.",
            example = "Problem not found with id 100"
    )
    private String message;

    @Schema(
            description = "Requested API path.",
            example = "/api/problems/100"
    )
    private String path;

    @Schema(
            description = "Unique trace identifier used for distributed tracing.",
            example = "3eaf90d68d3e4f96"
    )
    private String traceId;

    @Schema(
            description = "Validation errors. Present only for validation failures."
    )
    private Map<String, String> validationErrors;
}