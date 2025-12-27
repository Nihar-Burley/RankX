package com.application.problemservice.dto;

import com.application.problemservice.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String statement;

    @NotNull
    private Difficulty difficulty;

    @NotEmpty
    private List<String> tags;

    private String constraints;
    private String editorial;
    private Long createdBy;
}
