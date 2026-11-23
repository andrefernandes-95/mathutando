package pt.mathutando.api.exercises;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class ExerciseDefinitionValidatorTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExerciseDefinitionValidator validator =
            new ExerciseDefinitionValidator(List.of(new SingleChoiceDefinitionValidator()));

    @Test
    void acceptsValidStep() throws Exception {
        assertDoesNotThrow(() -> validator.validate(mapper.readTree("""
                {"schemaVersion":1,"steps":[{"id":"s1","prompt":"Pergunta?","interaction":{
                  "type":"single-choice","correctOptionId":"b","options":[
                    {"id":"a","label":"Não"},{"id":"b","label":"Sim"}]}}]}
                """)));
    }

    @Test
    void rejectsMissingAnswer() throws Exception {
        assertThrows(IllegalArgumentException.class, () -> validator.validate(mapper.readTree("""
                {"schemaVersion":1,"steps":[{"id":"s1","prompt":"Pergunta?","interaction":{
                  "type":"single-choice","correctOptionId":"x","options":[
                    {"id":"a","label":"Não"},{"id":"b","label":"Sim"}]}}]}
                """)));
    }

    @Test
    void rejectsDuplicateStepIds() throws Exception {
        assertThrows(IllegalArgumentException.class, () -> validator.validate(mapper.readTree("""
                {"schemaVersion":1,"steps":[
                  {"id":"s1","prompt":"Q1","interaction":{"type":"single-choice","correctOptionId":"a","options":[{"id":"a","label":"A"},{"id":"b","label":"B"}]}},
                  {"id":"s1","prompt":"Q2","interaction":{"type":"single-choice","correctOptionId":"a","options":[{"id":"a","label":"A"},{"id":"b","label":"B"}]}}
                ]}
                """)));
    }
}
