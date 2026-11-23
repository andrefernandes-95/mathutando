package pt.mathutando.api.exercises;

import java.util.HashSet;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;

@Component
public class SingleChoiceDefinitionValidator implements InteractionDefinitionValidator {
    @Override
    public String type() {
        return "single-choice";
    }

    @Override
    public void validate(JsonNode interaction) {
        var options = interaction.path("options");
        var correctId = interaction.path("correctOptionId").asText("");
        if (!options.isArray() || options.size() < 2 || correctId.isBlank()) {
            throw new IllegalArgumentException("Escolha múltipla requer pelo menos duas opções e uma resposta correta");
        }
        var ids = new HashSet<String>();
        for (var option : options) {
            var id = option.path("id").asText("");
            if (id.isBlank() || option.path("label").asText("").isBlank() || !ids.add(id)) {
                throw new IllegalArgumentException("Opção duplicada ou incompleta");
            }
        }
        if (!ids.contains(correctId)) {
            throw new IllegalArgumentException("Resposta correta não encontrada nas opções");
        }
    }
}
