-- Demo data for Digistore24 Automation Dashboard
-- This script creates 20 sample sales with realistic German digital products
-- Run this in your Supabase SQL editor to populate the database with demo data

-- Clear existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM sales WHERE order_id LIKE 'DS24-2026-%';

-- Insert demo sales data
INSERT INTO sales (order_id, product_name, amount, buyer_email, buyer_name, affiliate_id, status, created_at)
VALUES 
  -- Recent sales (last 7 days)
  ('DS24-2026-001', 'Online Marketing Masterclass', 297.00, 'max.mueller@example.com', 'Max Müller', 'AFF-123', 'completed', NOW() - INTERVAL '1 day'),
  ('DS24-2026-002', 'SEO Komplettkurs 2026', 197.00, 'anna.schmidt@example.com', 'Anna Schmidt', 'AFF-456', 'completed', NOW() - INTERVAL '1 day'),
  ('DS24-2026-003', 'Social Media Marketing Bundle', 497.00, 'thomas.weber@example.com', 'Thomas Weber', 'AFF-123', 'completed', NOW() - INTERVAL '2 days'),
  ('DS24-2026-004', 'E-Mail Marketing Grundlagen', 47.00, 'julia.wagner@example.com', 'Julia Wagner', NULL, 'completed', NOW() - INTERVAL '2 days'),
  ('DS24-2026-005', 'Facebook Ads Meisterkurs', 197.00, 'michael.becker@example.com', 'Michael Becker', 'AFF-789', 'completed', NOW() - INTERVAL '3 days'),
  ('DS24-2026-006', 'Affiliate Marketing Erfolgsformel', 97.00, 'sarah.hoffmann@example.com', 'Sarah Hoffmann', 'AFF-456', 'completed', NOW() - INTERVAL '3 days'),
  ('DS24-2026-007', 'Content Creation Masterclass', 297.00, 'daniel.schulz@example.com', 'Daniel Schulz', 'AFF-123', 'completed', NOW() - INTERVAL '4 days'),
  
  -- Sales from last 2 weeks
  ('DS24-2026-008', 'Instagram Marketing Strategie', 147.00, 'laura.fischer@example.com', 'Laura Fischer', NULL, 'completed', NOW() - INTERVAL '8 days'),
  ('DS24-2026-009', 'YouTube Kanal aufbauen', 197.00, 'kevin.meyer@example.com', 'Kevin Meyer', 'AFF-789', 'completed', NOW() - INTERVAL '9 days'),
  ('DS24-2026-010', 'Webinar Erfolgsformel', 497.00, 'petra.koch@example.com', 'Petra Koch', 'AFF-123', 'completed', NOW() - INTERVAL '10 days'),
  ('DS24-2026-011', 'Google Ads Grundkurs', 97.00, 'markus.richter@example.com', 'Markus Richter', 'AFF-456', 'completed', NOW() - INTERVAL '11 days'),
  ('DS24-2026-012', 'Funnel Building Blueprint', 297.00, 'nina.klein@example.com', 'Nina Klein', NULL, 'completed', NOW() - INTERVAL '12 days'),
  ('DS24-2026-013', 'Copywriting Meisterkurs', 197.00, 'stefan.wolf@example.com', 'Stefan Wolf', 'AFF-789', 'completed', NOW() - INTERVAL '13 days'),
  
  -- Sales from last month
  ('DS24-2026-014', 'Online Business Starter Paket', 497.00, 'jennifer.neumann@example.com', 'Jennifer Neumann', 'AFF-123', 'completed', NOW() - INTERVAL '15 days'),
  ('DS24-2026-015', 'LinkedIn Marketing Pro', 147.00, 'alexander.schwarz@example.com', 'Alexander Schwarz', 'AFF-456', 'completed', NOW() - INTERVAL '18 days'),
  ('DS24-2026-016', 'Podcast Starter Guide', 97.00, 'christina.zimmermann@example.com', 'Christina Zimmermann', NULL, 'completed', NOW() - INTERVAL '20 days'),
  ('DS24-2026-017', 'TikTok Marketing Revolution', 197.00, 'patrick.braun@example.com', 'Patrick Braun', 'AFF-789', 'completed', NOW() - INTERVAL '22 days'),
  ('DS24-2026-018', 'Video Marketing Masterclass', 297.00, 'sabrina.hartmann@example.com', 'Sabrina Hartmann', 'AFF-123', 'completed', NOW() - INTERVAL '25 days'),
  ('DS24-2026-019', 'Conversion Optimierung Kurs', 147.00, 'tobias.lange@example.com', 'Tobias Lange', 'AFF-456', 'completed', NOW() - INTERVAL '28 days'),
  ('DS24-2026-020', 'E-Commerce Erfolgsformel', 497.00, 'melanie.krause@example.com', 'Melanie Krause', NULL, 'completed', NOW() - INTERVAL '29 days');

-- Insert demo affiliate data
INSERT INTO affiliates (affiliate_id, name, email, total_sales, total_commission, created_at)
VALUES 
  ('AFF-123', 'Marketing Pro Affiliates', 'contact@marketingpro.de', 0, 0, NOW() - INTERVAL '90 days'),
  ('AFF-456', 'Digital Success Network', 'info@digitalsuccess.de', 0, 0, NOW() - INTERVAL '60 days'),
  ('AFF-789', 'Online Marketing Experts', 'hello@omexperts.de', 0, 0, NOW() - INTERVAL '45 days')
ON CONFLICT (affiliate_id) DO NOTHING;

-- Update affiliate statistics (this will calculate total_sales and total_commission)
-- Note: You can run the updateAffiliateStats function from your application 
-- or manually calculate here

UPDATE affiliates SET 
  total_sales = (
    SELECT COUNT(*) 
    FROM sales 
    WHERE sales.affiliate_id = affiliates.affiliate_id
  ),
  total_commission = (
    SELECT COALESCE(SUM(amount * 0.2), 0) 
    FROM sales 
    WHERE sales.affiliate_id = affiliates.affiliate_id
  )
WHERE affiliate_id IN ('AFF-123', 'AFF-456', 'AFF-789');

-- Verification queries (optional - uncomment to run)
-- SELECT COUNT(*) as total_sales FROM sales;
-- SELECT product_name, amount, buyer_name, created_at FROM sales ORDER BY created_at DESC LIMIT 10;
-- SELECT affiliate_id, name, total_sales, total_commission FROM affiliates;
-- SELECT DATE(created_at) as date, COUNT(*) as sales, SUM(amount) as revenue FROM sales GROUP BY DATE(created_at) ORDER BY date DESC;

-- Success message
SELECT 'Demo data inserted successfully! 20 sales and 3 affiliates created.' as message;
