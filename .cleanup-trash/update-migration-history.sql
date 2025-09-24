-- Update migration history to mark migrations as applied
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES 
('20250725044538_InitialCreate', '8.0.0'),
('20250725153609_AddSubscriptionPlans', '8.0.0'),
('20250728085358_FixModelChanges', '8.0.0'),
('20250728152206_AddSubscriptionAndReviewFields', '8.0.0'),
('20250730093650_AddGoHighLevelCourseFields', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;