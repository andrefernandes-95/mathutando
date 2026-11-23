package pt.mathutando.api.exercises;

import tools.jackson.databind.JsonNode;

/** A definição da versão publicada fica congelada e não contém estado da tentativa. */
public record ExerciseDetail(ExerciseSummary exercise, JsonNode definition) {}
