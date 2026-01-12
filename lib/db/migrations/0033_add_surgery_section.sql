-- Add surgery section to form configuration
UPDATE "ClinicConfig"
SET "formConfig" =
  jsonb_set(
    "formConfig"::jsonb,
    '{sections,surgery}',
    COALESCE(
      "formConfig"::jsonb #> '{sections,surgery}',
      '{"enabled": true, "fields": {"nomeCirurgia": {"enabled": true}, "dataCirurgia": {"enabled": true}, "horaCirurgia": {"enabled": true}}}'::jsonb
    ),
    true
  )
WHERE
  ("formConfig"::jsonb #> '{sections,surgery}') IS NULL;
