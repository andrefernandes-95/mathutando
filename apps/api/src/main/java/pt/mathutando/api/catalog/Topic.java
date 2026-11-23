package pt.mathutando.api.catalog;

import java.util.UUID;

public record Topic(UUID id, UUID parentId, String slug, String name, Integer schoolYear, int sortOrder) {}
