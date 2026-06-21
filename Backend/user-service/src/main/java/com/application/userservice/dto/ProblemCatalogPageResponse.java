package com.application.userservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProblemCatalogPageResponse {

    private List<ProblemCatalogItemView> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
