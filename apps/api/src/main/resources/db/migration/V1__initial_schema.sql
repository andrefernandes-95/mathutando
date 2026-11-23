-- Mathutando: identity and curriculum
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE topics (
    id UUID PRIMARY KEY,
    parent_id UUID REFERENCES topics(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    school_year SMALLINT CHECK (school_year BETWEEN 1 AND 12),
    sort_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT topic_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE INDEX idx_topics_parent ON topics(parent_id);
CREATE INDEX idx_topics_year ON topics(school_year);

-- Stable exercise metadata and immutable published payloads
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    author_id UUID REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    title VARCHAR(240) NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    author_difficulty SMALLINT NOT NULL CHECK (author_difficulty BETWEEN 1 AND 5),
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'HIDDEN')),
    published_version INTEGER CHECK (published_version > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    CONSTRAINT published_requires_version CHECK (status <> 'PUBLISHED' OR (published_version IS NOT NULL AND published_at IS NOT NULL))
);
CREATE INDEX idx_exercises_catalog ON exercises(status, published_at DESC);
CREATE INDEX idx_exercises_topic ON exercises(topic_id);
CREATE INDEX idx_exercises_author ON exercises(author_id);

CREATE TABLE exercise_versions (
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    definition JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (exercise_id, version_number),
    CONSTRAINT definition_is_object CHECK (jsonb_typeof(definition) = 'object')
);

-- A user's progress is tied to the exact version solved.
CREATE TABLE exercise_attempts (
    id UUID PRIMARY KEY,
    exercise_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(16) NOT NULL DEFAULT 'IN_PROGRESS'
        CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    FOREIGN KEY (exercise_id, version_number) REFERENCES exercise_versions(exercise_id, version_number)
);
CREATE INDEX idx_attempts_user ON exercise_attempts(user_id, started_at DESC);

CREATE TABLE attempt_events (
    id UUID PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exercise_attempts(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL CHECK (sequence_number >= 0),
    step_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, sequence_number)
);

-- Lightweight community. A post references an exercise instead of duplicating it.
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id),
    exercise_id UUID REFERENCES exercises(id),
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
    status VARCHAR(16) NOT NULL DEFAULT 'VISIBLE'
        CHECK (status IN ('VISIBLE', 'HIDDEN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE TABLE exercise_comments (
    id UUID PRIMARY KEY,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    author_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
    status VARCHAR(16) NOT NULL DEFAULT 'VISIBLE'
        CHECK (status IN ('VISIBLE', 'HIDDEN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_exercise ON exercise_comments(exercise_id, created_at);

CREATE TABLE difficulty_ratings (
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    user_id UUID NOT NULL REFERENCES users(id),
    difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (exercise_id, user_id)
);
