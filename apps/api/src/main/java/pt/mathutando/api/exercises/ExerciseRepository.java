package pt.mathutando.api.exercises;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

@Repository
public class ExerciseRepository {
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper json;

    public ExerciseRepository(NamedParameterJdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    private static final RowMapper<ExerciseSummary> SUMMARY = (rs, row) -> summary(rs);

    private static ExerciseSummary summary(ResultSet rs) throws SQLException {
        return new ExerciseSummary(
                rs.getObject("id", UUID.class), rs.getString("title"), rs.getString("summary"),
                rs.getObject("topic_id", UUID.class), rs.getInt("author_difficulty"),
                rs.getInt("published_version"), rs.getTimestamp("published_at").toInstant());
    }

    public List<ExerciseSummary> findPublished(UUID topicId, Integer year, int limit) {
        var sql = new StringBuilder("""
                SELECT e.id, e.title, e.summary, e.topic_id, e.author_difficulty,
                       e.published_version, e.published_at
                FROM exercises e JOIN topics t ON t.id = e.topic_id
                WHERE e.status = 'PUBLISHED' AND e.published_version IS NOT NULL
                """);
        var params = new MapSqlParameterSource().addValue("limit", limit);
        if (topicId != null) {
            sql.append(" AND e.topic_id = :topicId");
            params.addValue("topicId", topicId);
        }
        if (year != null) {
            sql.append(" AND t.school_year = :year");
            params.addValue("year", year);
        }
        sql.append(" ORDER BY e.published_at DESC, e.id LIMIT :limit");
        return jdbc.query(sql.toString(), params, SUMMARY);
    }

    public Optional<ExerciseDetail> findPublishedById(UUID id) {
        var sql = """
                SELECT e.id, e.title, e.summary, e.topic_id, e.author_difficulty,
                       e.published_version, e.published_at, v.definition::text AS definition
                FROM exercises e
                JOIN exercise_versions v
                  ON v.exercise_id = e.id AND v.version_number = e.published_version
                WHERE e.id = :id AND e.status = 'PUBLISHED'
                """;
        var result = jdbc.query(sql, new MapSqlParameterSource("id", id), (rs, row) -> {
            try {
                return new ExerciseDetail(summary(rs), json.readTree(rs.getString("definition")));
            } catch (Exception error) {
                throw new IllegalStateException("Definição JSON inválida na base de dados", error);
            }
        });
        return result.stream().findFirst();
    }
}
