package pt.mathutando.api.exercises;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Endpoints públicos de leitura. Escrita exige autenticação e revisão do fluxo de publicação. */
@RestController
@RequestMapping("/api/v1/exercises")
public class ExerciseController {
    private final ExerciseRepository exercises;

    public ExerciseController(ExerciseRepository exercises) {
        this.exercises = exercises;
    }

    @GetMapping
    public List<ExerciseSummary> list(
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "20") int limit) {
        if (year != null && (year < 1 || year > 12)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ano escolar inválido");
        }
        return exercises.findPublished(topicId, year, Math.clamp(limit, 1, 50));
    }

    @GetMapping("/{id}")
    public ExerciseDetail get(@PathVariable UUID id) {
        return exercises.findPublishedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercício não encontrado"));
    }
}
