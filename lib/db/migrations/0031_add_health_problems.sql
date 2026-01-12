-- Add ortopedicos and digestivos fields to healthProblems section
UPDATE "ClinicConfig"
SET "formConfig" =
  jsonb_set(
    jsonb_set(
      "formConfig"::jsonb,
      '{sections,healthProblems,fields,ortopedicos}',
      COALESCE(
        "formConfig"::jsonb #> '{sections,healthProblems,fields,ortopedicos}',
        '{"enabled": false}'::jsonb
      ),
      true
    ),
    '{sections,healthProblems,fields,digestivos}',
    COALESCE(
      "formConfig"::jsonb #> '{sections,healthProblems,fields,digestivos}',
      '{"enabled": false}'::jsonb
    ),
    true
  )
WHERE
  ("formConfig"::jsonb #> '{sections,healthProblems,fields,ortopedicos}') IS NULL
  OR ("formConfig"::jsonb #> '{sections,healthProblems,fields,digestivos}') IS NULL;
