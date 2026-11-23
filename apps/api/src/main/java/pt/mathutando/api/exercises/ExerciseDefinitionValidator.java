package pt.mathutando.api.exercises;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

/** Ponto único de validação antes de aceitar qualquer versão criada por humano ou IA. */
@Component
public class ExerciseDefinitionValidator {
    private final java.util.Map<String, InteractionDefinitionValidator> validators;

    public ExerciseDefinitionValidator(List<InteractionDefinitionValidator> implementations) {
        var byType = new HashMap<String, InteractionDefinitionValidator>();
        for (var validator : implementations) {
            if (byType.putIfAbsent(validator.type(), validator) != null) {
                throw new IllegalStateException("Validador duplicado: " + validator.type());
            }
        }
        validators = java.util.Map.copyOf(byType);
    }

    public void validate(JsonNode definition) {
        if (definition == null || !definition.isObject() || definition.path("schemaVersion").asInt() != 1) {
            throw new IllegalArgumentException("Versão do contrato inválida");
        }
        var steps = definition.path("steps");
        if (!steps.isArray() || steps.isEmpty()) {
            throw new IllegalArgumentException("O exercício deve ter etapas");
        }
        var ids = new HashSet<String>();
        for (var step : steps) {
            var id = step.path("id").asText("");
            if (id.isBlank() || !ids.add(id) || step.path("prompt").asText("").isBlank()) {
                throw new IllegalArgumentException("Etapa incompleta ou ID duplicado");
            }
            var interaction = step.path("interaction");
            var type = interaction.path("type").asText("");
            var validator = validators.get(type);
            if (validator == null) {
                throw new IllegalArgumentException("Interação não suportada: " + type);
            }
            validator.validate(interaction);
        }
    }
}
