package pt.mathutando.api.catalog;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TopicRepository {
    private final JdbcTemplate jdbc;

    public TopicRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Topic> findAll() {
        return jdbc.query("""
                SELECT id, parent_id, slug, name, school_year, sort_order
                FROM topics ORDER BY sort_order, name
                """, (rs, index) -> new Topic(
                rs.getObject("id", UUID.class),
                rs.getObject("parent_id", UUID.class),
                rs.getString("slug"), rs.getString("name"),
                rs.getObject("school_year") == null ? null : ((Number) rs.getObject("school_year")).intValue(),
                rs.getInt("sort_order")));
    }
}
