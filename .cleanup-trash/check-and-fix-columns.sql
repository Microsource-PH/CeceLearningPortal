-- Check current column names in courses table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Rename columns from PascalCase to snake_case if needed
DO $$ 
BEGIN
    -- Only rename if the column exists with PascalCase
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AccessDuration') THEN
        ALTER TABLE courses RENAME COLUMN "AccessDuration" TO access_duration;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'CourseType') THEN
        ALTER TABLE courses RENAME COLUMN "CourseType" TO course_type;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DeliveryMethod') THEN
        ALTER TABLE courses RENAME COLUMN "DeliveryMethod" TO delivery_method;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'DeliverySpecifics') THEN
        ALTER TABLE courses RENAME COLUMN "DeliverySpecifics" TO delivery_specifics;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'AdditionalResources') THEN
        ALTER TABLE courses RENAME COLUMN "AdditionalResources" TO additional_resources;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ProgressTracking') THEN
        ALTER TABLE courses RENAME COLUMN "ProgressTracking" TO progress_tracking;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'CommunitySupport') THEN
        ALTER TABLE courses RENAME COLUMN "CommunitySupport" TO community_support;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsGoHighLevelListing') THEN
        ALTER TABLE courses RENAME COLUMN "IsGoHighLevelListing" TO is_go_high_level_listing;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'GoHighLevelOfferProperties') THEN
        ALTER TABLE courses RENAME COLUMN "GoHighLevelOfferProperties" TO go_high_level_offer_properties;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'CourseImage') THEN
        ALTER TABLE courses RENAME COLUMN "CourseImage" TO course_image;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'LockOfferId') THEN
        ALTER TABLE courses RENAME COLUMN "LockOfferId" TO lock_offer_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'RestrictedToLocationId') THEN
        ALTER TABLE courses RENAME COLUMN "RestrictedToLocationId" TO restricted_to_location_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsPublished') THEN
        ALTER TABLE courses RENAME COLUMN "IsPublished" TO is_published;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'RetailPrice') THEN
        ALTER TABLE courses RENAME COLUMN "RetailPrice" TO retail_price;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsFree') THEN
        ALTER TABLE courses RENAME COLUMN "IsFree" TO is_free;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ProductIdVersion') THEN
        ALTER TABLE courses RENAME COLUMN "ProductIdVersion" TO product_id_version;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'CompanyId') THEN
        ALTER TABLE courses RENAME COLUMN "CompanyId" TO company_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'RestrictedToUserIds') THEN
        ALTER TABLE courses RENAME COLUMN "RestrictedToUserIds" TO restricted_to_user_ids;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ProductGroupId') THEN
        ALTER TABLE courses RENAME COLUMN "ProductGroupId" TO product_group_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'EnablePurchaseButton') THEN
        ALTER TABLE courses RENAME COLUMN "EnablePurchaseButton" TO enable_purchase_button;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsPasswordProtected') THEN
        ALTER TABLE courses RENAME COLUMN "IsPasswordProtected" TO is_password_protected;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'ProductPassword') THEN
        ALTER TABLE courses RENAME COLUMN "ProductPassword" TO product_password;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'IsDeleted') THEN
        ALTER TABLE courses RENAME COLUMN "IsDeleted" TO is_deleted;
    END IF;
END $$;

-- Check the results
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;