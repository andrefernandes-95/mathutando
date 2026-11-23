package pt.mathutando.api.exercises;

import java.time.Instant;
import java.util.UUID;

public record ExerciseSummary(
        UUID id, String title, String summary, UUID topicId,
        int authorDifficulty, int currentVersion, Instant publishedAt) {}
