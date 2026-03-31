-- Add attachments column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN feedback.attachments IS 'Array of file attachments with filename, originalname, path, mimetype, size';
