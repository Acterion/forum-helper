-- baseline initial schema
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text NOT NULL
);

CREATE TABLE IF NOT EXISTS case_t (
  id text PRIMARY KEY,
  main_post jsonb,
  replies jsonb
);

CREATE TABLE IF NOT EXISTS submission (
  id text PRIMARY KEY,
  data_consent boolean,
  debriefing_consent boolean,
  branch text,
  pre_qs jsonb,
  post_qs jsonb,
  prolific_pid text,
  study_id text,
  session_id text
);

CREATE TABLE IF NOT EXISTS case_response (
  id text PRIMARY KEY,
  submission_id text NOT NULL REFERENCES submission(id),
  case_id text NOT NULL,
  pre_confidence integer NOT NULL,
  ai_suggestion text,
  reply_text text,
  post_confidence integer,
  post_stress integer,
  action_sequence jsonb
);

CREATE TABLE IF NOT EXISTS branch_counts (
  branch text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0
);

INSERT INTO branch_counts (branch, count)
VALUES ('branch-a', 0), ('branch-b', 0)
ON CONFLICT DO NOTHING;
