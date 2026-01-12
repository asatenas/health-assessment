-- Add tabaco field to habitsAndVices section
UPDATE "ClinicConfig"
SET "formConfig" =
  jsonb_set(
    "formConfig"::jsonb,
    '{sections,habitsAndVices,fields,tabaco}',
    COALESCE(
      "formConfig"::jsonb #> '{sections,habitsAndVices,fields,tabaco}',
      '{"enabled": true}'::jsonb
    ),
    true
  )
WHERE
  ("formConfig"::jsonb #> '{sections,habitsAndVices,fields,tabaco}') IS NULL;
