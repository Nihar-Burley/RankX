    package com.application.quizservice.service;

    import com.application.quizservice.dto.QuizAnalyticsResponse;
    import com.application.quizservice.dto.QuizRequest;
    import com.application.quizservice.dto.QuizResponse;
    import com.application.quizservice.entity.DifficultyLevel;
    import com.application.quizservice.exception.ResourceNotFoundException;
    import com.application.quizservice.entity.Quiz;
    import com.application.quizservice.entity.QuizStatus;
    import com.application.quizservice.repository.QuizRepository;
    import com.application.quizservice.service.QuizService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.UUID;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    @Transactional
    public class QuizServiceImpl implements QuizService {

        private final QuizRepository quizRepository;

        // ================= ADMIN LOGIC =================

        @Override
        public QuizResponse createQuiz(QuizRequest request) {
            Quiz quiz = Quiz.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .durationMinutes(request.getDurationMinutes())
                    .status(QuizStatus.DRAFT)
                    .createdAt(LocalDateTime.now())
                    .category(request.getCategory())         // <-- add this
                    .subCategory(request.getSubCategory())   // <-- add this
                    .difficulty(request.getDifficulty())     // <-- add this
                    .build();


            return mapToResponse(quizRepository.save(quiz));
        }

        @Override
        public QuizResponse updateQuiz(UUID quizId, QuizRequest request) {
            Quiz quiz = getQuizOrThrow(quizId);

    //        if (quiz.getStatus() == QuizStatus.PUBLISHED) {
    //            throw new IllegalStateException("Published quiz cannot be modified");
    //        }

            // Log the incoming request
            System.out.println("Updating quiz ID: " + quizId);
            System.out.println("Payload: " + request);

            // Update all fields from request
            quiz.setTitle(request.getTitle());
            quiz.setDescription(request.getDescription());
            quiz.setDurationMinutes(request.getDurationMinutes());
            quiz.setCategory(request.getCategory());
            quiz.setSubCategory(request.getSubCategory());

            // Handle enum safely
            if (request.getDifficulty() != null) {
                try {
                    quiz.setDifficulty(DifficultyLevel.valueOf(request.getDifficulty().name()));
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid difficulty level: " + request.getDifficulty());
                }
            }

            Quiz updated = quizRepository.save(quiz);
            System.out.println("Updated quiz entity: " + updated);

            return mapToResponse(updated);
        }


        @Override
        public void deleteQuiz(UUID quizId) {
            Quiz quiz = getQuizOrThrow(quizId);
            quizRepository.delete(quiz);
        }

        @Override
        public void publishQuiz(UUID quizId) {
            Quiz quiz = getQuizOrThrow(quizId);

            if (quiz.getStatus() == QuizStatus.PUBLISHED) {
                throw new IllegalStateException("Quiz is already published");
            }

            quiz.setStatus(QuizStatus.PUBLISHED);
            quizRepository.save(quiz);
        }

        @Override
        public void updateStatus(UUID quizId, QuizStatus status) {
            Quiz quiz = getQuizOrThrow(quizId);

            if (quiz.getStatus() == status) {
                throw new IllegalStateException("Quiz is already published");
            }

            quiz.setStatus(status);
            quizRepository.save(quiz);
        }

        // ================= USER LOGIC =================

        @Override
        @Transactional(readOnly = true)
        public List<QuizResponse> getPublishedQuizzes() {
            return quizRepository.findByStatus(QuizStatus.PUBLISHED)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public QuizResponse getPublishedQuizById(UUID quizId) {
            Quiz quiz = quizRepository
                    .findByIdAndStatus(quizId, QuizStatus.PUBLISHED)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Published quiz not found"));

            return mapToResponse(quiz);
        }

        @Override
        @Transactional(readOnly = true)
        public QuizResponse getQuizById(UUID quizId) {
            Quiz quiz = quizRepository
                    .findById(quizId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Published quiz not found"));

            return mapToResponse(quiz);
        }

        public List<QuizResponse> getPublishedQuizzes(
                String category,
                String subCategory,
                DifficultyLevel difficulty
        ) {

            if (category == null && difficulty == null && subCategory == null) {
                return quizRepository.findByStatus(QuizStatus.PUBLISHED)
                        .stream().map(this::mapToResponse).toList();
            }

            if (category != null && difficulty != null && subCategory != null) {
                return quizRepository
                        .findByStatusAndCategoryAndSubCategoryAndDifficulty(
                                QuizStatus.PUBLISHED, category, subCategory, difficulty
                        )
                        .stream().map(this::mapToResponse).toList();
            }

            if (category != null && difficulty != null) {
                return quizRepository
                        .findByStatusAndCategoryAndDifficulty(
                                QuizStatus.PUBLISHED, category, difficulty
                        )
                        .stream().map(this::mapToResponse).toList();
            }

            if (category != null) {
                return quizRepository
                        .findByStatusAndCategory(QuizStatus.PUBLISHED, category)
                        .stream().map(this::mapToResponse).toList();
            }

            return quizRepository.findByStatus(QuizStatus.PUBLISHED)
                    .stream().map(this::mapToResponse).toList();
        }


        @Override
        @Transactional(readOnly = true)
        public List<QuizResponse> getAllQuizzesFilter(String category, String subCategory) {

            if (category == null && subCategory == null) {
                return quizRepository.findAll()
                        .stream().map(this::mapToResponse).toList();
            }

            if (category != null && subCategory != null) {
                return quizRepository
                        .findByCategoryAndSubCategory(category, subCategory)
                        .stream().map(this::mapToResponse).toList();
            }

            return quizRepository
                    .findByCategory(category)
                    .stream().map(this::mapToResponse).toList();
        }


        @Override
        @Transactional(readOnly = true)
        public List<QuizResponse> getAllQuizzes() {

            return quizRepository.findAll().stream().map(this::mapToResponse).toList();
        }

        @Override
        @Transactional(readOnly = true)
        public QuizAnalyticsResponse getQuizAnalytics() {

            long totalQuizzes = quizRepository.count();// custom query

            return new QuizAnalyticsResponse(
                    totalQuizzes
            );
        }

        @Override
        public void bulkPublish(List<UUID> quizIds, boolean published) {

            QuizStatus status = published
                    ? QuizStatus.PUBLISHED
                    : QuizStatus.DRAFT;

            quizRepository.updateStatusBulk(quizIds, status);
        }

        @Override
        public void bulkDelete(List<UUID> quizIds) {
            quizRepository.deleteAllByIdInBatch(quizIds);
        }



        // ================= HELPER METHODS =================

        private Quiz getQuizOrThrow(UUID quizId) {
            return quizRepository.findById(quizId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Quiz not found with id: " + quizId));
        }

        private QuizResponse mapToResponse(Quiz quiz) {
            return QuizResponse.builder()
                    .id(quiz.getId())
                    .title(quiz.getTitle())
                    .description(quiz.getDescription())
                    .durationMinutes(quiz.getDurationMinutes())
                    .status(quiz.getStatus().name())
                    .createdAt(quiz.getCreatedAt())
                    .category(quiz.getCategory())
                    .subCategory(quiz.getSubCategory())
                    .difficulty(quiz.getDifficulty())
                    .build();
        }


    }
