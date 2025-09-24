-- Add discount pricing to courses
-- This migration adds original_price to courses and sets up sample discount data

-- Update courses with original prices (20-40% discount examples)
UPDATE courses 
SET original_price = CASE 
    WHEN price < 2000 THEN price * 1.25  -- 20% discount
    WHEN price < 5000 THEN price * 1.33  -- 25% discount
    WHEN price < 10000 THEN price * 1.43 -- 30% discount
    ELSE price * 1.67                    -- 40% discount
END
WHERE original_price IS NULL OR original_price = price;

-- Add some specific discounts to popular courses
UPDATE courses 
SET original_price = 7499.00 
WHERE title LIKE '%React%' AND price = 4499.00;

UPDATE courses 
SET original_price = 4999.00 
WHERE title LIKE '%JavaScript%' AND price = 2999.00;

UPDATE courses 
SET original_price = 12999.00 
WHERE title LIKE '%Machine Learning%' AND price = 7799.00;

UPDATE courses 
SET original_price = 9999.00 
WHERE title LIKE '%Full Stack%' AND price = 5999.00;

-- Ensure all courses have at least their current price as original_price
UPDATE courses 
SET original_price = price 
WHERE original_price IS NULL;