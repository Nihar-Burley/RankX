package com.application.attemptservice.service;

import com.application.attemptservice.dto.AnswerRequest;
import com.application.attemptservice.entity.Answer;
import com.application.attemptservice.entity.Attempt;
import com.application.attemptservice.entity.AttemptStatus;
import com.application.attemptservice.repository.AnswerRepository;
import com.application.attemptservice.repository.AttemptRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttemptMicroserviceQaTest {

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private AnswerRepository answerRepository;

    @InjectMocks
    private AttemptServiceImpl attemptService;

    @Captor
    private ArgumentCaptor<Attempt> attemptCaptor;

    @Captor
    private ArgumentCaptor<Answer> answerCaptor;

    @ParameterizedTest(name = "startAttempt should reuse latest in-progress attempt for quiz seed {0}")
    @MethodSource("quizProfiles")
    void startAttemptShouldReuseExistingAttempt(UUID quizId, UUID userId) {
        UUID existingAttemptId = UUID.randomUUID();
        Attempt existing = Attempt.builder()
                .id(existingAttemptId)
                .quizId(quizId)
                .userId(userId)
                .status(AttemptStatus.IN_PROGRESS)
                .build();
        when(attemptRepository.findFirstByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(userId, quizId, AttemptStatus.IN_PROGRESS))
                .thenReturn(Optional.of(existing));

        UUID actual = attemptService.startAttempt(quizId, userId);

        assertThat(actual).isEqualTo(existingAttemptId);
        verify(attemptRepository, never()).save(any(Attempt.class));
    }

    @ParameterizedTest(name = "startAttempt should create new attempt for quiz seed {0}")
    @MethodSource("quizProfiles")
    void startAttemptShouldCreateNewAttempt(UUID quizId, UUID userId) {
        when(attemptRepository.findFirstByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(userId, quizId, AttemptStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(invocation -> {
            Attempt attempt = invocation.getArgument(0);
            if (attempt.getId() == null) {
                attempt.setId(UUID.randomUUID());
            }
            return attempt;
        });

        UUID actual = attemptService.startAttempt(quizId, userId);

        assertThat(actual).isNotNull();
        verify(attemptRepository).save(attemptCaptor.capture());
        Attempt saved = attemptCaptor.getValue();
        assertThat(saved.getQuizId()).isEqualTo(quizId);
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getStatus()).isEqualTo(AttemptStatus.IN_PROGRESS);
    }

    @ParameterizedTest(name = "saveAnswer should create new answer with option {0}")
    @ValueSource(strings = {"A", "B", "C", "D"})
    void saveAnswerShouldCreateNewAnswer(String selectedOption) {
        UUID attemptId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        Attempt attempt = attempt(attemptId, userId, AttemptStatus.IN_PROGRESS);
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(answerRepository.findByAttemptAndQuestionId(attempt, questionId)).thenReturn(Optional.empty());
        when(answerRepository.save(any(Answer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        attemptService.saveAnswer(attemptId, userId, answerRequest(questionId, selectedOption));

        verify(answerRepository).save(answerCaptor.capture());
        Answer saved = answerCaptor.getValue();
        assertThat(saved.getAttempt()).isEqualTo(attempt);
        assertThat(saved.getQuestionId()).isEqualTo(questionId);
        assertThat(saved.getSelectedOption()).isEqualTo(selectedOption);
    }

    @ParameterizedTest(name = "saveAnswer should update existing answer to option {0}")
    @ValueSource(strings = {"A", "B", "C", "D"})
    void saveAnswerShouldUpdateExistingAnswer(String selectedOption) {
        UUID attemptId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();
        Attempt attempt = attempt(attemptId, userId, AttemptStatus.IN_PROGRESS);
        Answer existing = Answer.builder()
                .id(UUID.randomUUID())
                .attempt(attempt)
                .questionId(questionId)
                .selectedOption("A")
                .build();
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(answerRepository.findByAttemptAndQuestionId(attempt, questionId)).thenReturn(Optional.of(existing));
        when(answerRepository.save(any(Answer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        attemptService.saveAnswer(attemptId, userId, answerRequest(questionId, selectedOption));

        verify(answerRepository).save(existing);
        assertThat(existing.getSelectedOption()).isEqualTo(selectedOption);
    }

    @ParameterizedTest(name = "saveAnswer should reject missing attempt {0}")
    @ValueSource(strings = {
            "00000000-0000-0000-0000-000000000111",
            "00000000-0000-0000-0000-000000000222"
    })
    void saveAnswerShouldRejectMissingAttempt(String attemptIdValue) {
        UUID attemptId = UUID.fromString(attemptIdValue);
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attemptService.saveAnswer(
                attemptId,
                UUID.randomUUID(),
                answerRequest(UUID.randomUUID(), "A")
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @ParameterizedTest(name = "saveAnswer should reject unauthorized user profile {0}")
    @MethodSource("quizProfiles")
    void saveAnswerShouldRejectUnauthorizedUsers(UUID quizId, UUID ownerUserId) {
        UUID attemptId = UUID.randomUUID();
        Attempt attempt = attempt(attemptId, ownerUserId, AttemptStatus.IN_PROGRESS);
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> attemptService.saveAnswer(
                attemptId,
                UUID.randomUUID(),
                answerRequest(UUID.randomUUID(), "B")
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");

        verify(answerRepository, never()).save(any(Answer.class));
    }

    @ParameterizedTest(name = "saveAnswer should reject submitted attempt profile {0}")
    @ValueSource(strings = {"A", "B", "C", "D"})
    void saveAnswerShouldRejectSubmittedAttempt(String selectedOption) {
        UUID attemptId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(attemptRepository.findById(attemptId))
                .thenReturn(Optional.of(attempt(attemptId, userId, AttemptStatus.SUBMITTED)));

        assertThatThrownBy(() -> attemptService.saveAnswer(
                attemptId,
                userId,
                answerRequest(UUID.randomUUID(), selectedOption)
        )).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400 BAD_REQUEST");
    }

    @ParameterizedTest(name = "submitAttempt should mark submitted for quiz profile {0}")
    @MethodSource("quizProfiles")
    void submitAttemptShouldMarkAttemptSubmitted(UUID quizId, UUID userId) {
        UUID attemptId = UUID.randomUUID();
        Attempt attempt = attempt(attemptId, userId, AttemptStatus.IN_PROGRESS);
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        attemptService.submitAttempt(attemptId, userId);

        verify(attemptRepository).save(attempt);
        assertThat(attempt.getStatus()).isEqualTo(AttemptStatus.SUBMITTED);
        assertThat(attempt.getSubmittedAt()).isNotNull();
    }

    @ParameterizedTest(name = "submitAttempt should reject missing attempt {0}")
    @ValueSource(strings = {
            "00000000-0000-0000-0000-000000000333",
            "00000000-0000-0000-0000-000000000444"
    })
    void submitAttemptShouldRejectMissingAttempt(String attemptIdValue) {
        UUID attemptId = UUID.fromString(attemptIdValue);
        when(attemptRepository.findById(attemptId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> attemptService.submitAttempt(attemptId, UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @ParameterizedTest(name = "submitAttempt should reject unauthorized user profile {0}")
    @MethodSource("quizProfiles")
    void submitAttemptShouldRejectUnauthorizedUsers(UUID quizId, UUID ownerUserId) {
        UUID attemptId = UUID.randomUUID();
        when(attemptRepository.findById(attemptId))
                .thenReturn(Optional.of(attempt(attemptId, ownerUserId, AttemptStatus.IN_PROGRESS)));

        assertThatThrownBy(() -> attemptService.submitAttempt(attemptId, UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }

    @ParameterizedTest(name = "submitAttempt should reject already submitted attempt profile {0}")
    @MethodSource("quizProfiles")
    void submitAttemptShouldRejectAlreadySubmitted(UUID quizId, UUID userId) {
        UUID attemptId = UUID.randomUUID();
        when(attemptRepository.findById(attemptId))
                .thenReturn(Optional.of(attempt(attemptId, userId, AttemptStatus.SUBMITTED)));

        assertThatThrownBy(() -> attemptService.submitAttempt(attemptId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400 BAD_REQUEST");
    }

    private static Stream<Arguments> quizProfiles() {
        return Stream.of(
                arguments(UUID.fromString("11111111-1111-1111-1111-111111111111"), UUID.fromString("00000000-0000-0000-0000-000000000101")),
                arguments(UUID.fromString("12121212-1212-1212-1212-121212121212"), UUID.fromString("00000000-0000-0000-0000-000000000102")),
                arguments(UUID.fromString("13131313-1313-1313-1313-131313131313"), UUID.fromString("00000000-0000-0000-0000-000000000103")),
                arguments(UUID.fromString("20202020-2020-2020-2020-202020202020"), UUID.fromString("00000000-0000-0000-0000-000000000104")),
                arguments(UUID.fromString("23232323-2323-2323-2323-232323232323"), UUID.fromString("00000000-0000-0000-0000-000000000105"))
        );
    }

    private Attempt attempt(UUID attemptId, UUID userId, AttemptStatus status) {
        return Attempt.builder()
                .id(attemptId)
                .quizId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .userId(userId)
                .status(status)
                .build();
    }

    private AnswerRequest answerRequest(UUID questionId, String selectedOption) {
        AnswerRequest request = new AnswerRequest();
        request.setQuestionId(questionId);
        request.setSelectedOption(selectedOption);
        return request;
    }
}
