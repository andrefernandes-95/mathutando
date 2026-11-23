package pt.mathutando.api.catalog;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/topics")
public class TopicController {
    private final TopicRepository topics;

    public TopicController(TopicRepository topics) {
        this.topics = topics;
    }

    @GetMapping
    public List<Topic> list() {
        return topics.findAll();
    }
}
