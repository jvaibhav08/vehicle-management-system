SET @has_document_path = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'puc'
    AND column_name = 'document_path'
);

SET @statement = IF(
  @has_document_path = 0,
  'ALTER TABLE puc ADD COLUMN document_path VARCHAR(500) NULL AFTER expiry_date',
  'SELECT 1'
);
PREPARE add_document_path FROM @statement;
EXECUTE add_document_path;
DEALLOCATE PREPARE add_document_path;

SET @has_certificate_file = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'puc'
    AND column_name = 'certificate_file'
);

SET @statement = IF(
  @has_certificate_file > 0,
  'UPDATE puc SET document_path = certificate_file WHERE document_path IS NULL AND certificate_file IS NOT NULL',
  'SELECT 1'
);
PREPARE copy_legacy_document_path FROM @statement;
EXECUTE copy_legacy_document_path;
DEALLOCATE PREPARE copy_legacy_document_path;
