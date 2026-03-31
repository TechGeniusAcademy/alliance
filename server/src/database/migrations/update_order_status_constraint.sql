-- Add 'auction' and 'pending' to orders status constraint

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'auction' and 'pending' statuses
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'in_progress', 'review', 'completed', 'cancelled', 'disputed', 'auction', 'pending'));
