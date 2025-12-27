package com.application.problemservice.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedResponse<T> {

    private List<T> content;     // The actual list of items
    private int page;            // Current page number (0-based or 1-based depending on your design)
    private int size;            // Number of items per page
    private long totalElements;  // Total number of items across all pages
    private int totalPages;      // Total number of pages
    private boolean last;        // Whether this is the last page
}

