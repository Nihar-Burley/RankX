package com.application.userservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProblemCatalogItemView {

    private Long id;
    private String title;
    private String difficulty;
    private List<String> tags;
}
