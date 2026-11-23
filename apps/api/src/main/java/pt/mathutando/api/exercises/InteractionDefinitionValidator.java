package pt.mathutando.api.exercises;

import tools.jackson.databind.JsonNode;

/** Um tipo de interação regista o seu validador sem acoplar o catálogo à implementação. */
public interface InteractionDefinitionValidator {
    String type();
    void validate(JsonNode interaction);
}
