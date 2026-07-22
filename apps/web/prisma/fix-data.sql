-- Fix foreign key order: Tournament first, then HostCountry, HostCity, Stadium

-- 1. Tournament
INSERT OR IGNORE INTO Tournament (id, name, year, startDate, endDate, status, createdAt, updatedAt) VALUES ('t-2026', 'FIFA World Cup 2026', 2026, '2026-06-11', '2026-07-19', 'active', datetime('now'), datetime('now'));

-- 2. HostCountry
INSERT OR IGNORE INTO HostCountry (id, tournamentId, name, code, flag, createdAt, updatedAt) VALUES
('hc-usa', 't-2026', 'United States', 'US', '🇺🇸', datetime('now'), datetime('now')),
('hc-mexico', 't-2026', 'Mexico', 'MX', '🇲🇽', datetime('now'), datetime('now')),
('hc-canada', 't-2026', 'Canada', 'CA', '🇨🇦', datetime('now'), datetime('now'));

-- 3. HostCity
INSERT OR IGNORE INTO HostCity (id, hostCountryId, name, latitude, longitude, createdAt, updatedAt) VALUES
('city-metlife', 'hc-usa', 'New York / New Jersey', 40.8135, -74.0745, datetime('now'), datetime('now')),
('city-sofi', 'hc-usa', 'Los Angeles', 33.9534, -118.3387, datetime('now'), datetime('now')),
('city-att', 'hc-usa', 'Dallas', 32.7473, -97.0945, datetime('now'), datetime('now')),
('city-arrowhead', 'hc-usa', 'Kansas City', 39.0489, -94.4839, datetime('now'), datetime('now')),
('city-hardrock', 'hc-usa', 'Miami', 25.9580, -80.2389, datetime('now'), datetime('now')),
('city-lincoln', 'hc-usa', 'Philadelphia', 39.9008, -75.1675, datetime('now'), datetime('now')),
('city-levi', 'hc-usa', 'San Francisco Bay Area', 37.4033, -121.9698, datetime('now'), datetime('now')),
('city-gillette', 'hc-usa', 'Boston', 42.0909, -71.2643, datetime('now'), datetime('now')),
('city-nrg', 'hc-usa', 'Houston', 29.6847, -95.4107, datetime('now'), datetime('now')),
('city-mb', 'hc-usa', 'Atlanta', 33.7554, -84.4010, datetime('now'), datetime('now')),
('city-lumen', 'hc-usa', 'Seattle', 47.5952, -122.3316, datetime('now'), datetime('now')),
('city-bmo', 'hc-usa', 'Los Angeles', 34.0128, -118.2841, datetime('now'), datetime('now')),
('city-bc', 'hc-canada', 'Vancouver', 49.2778, -123.1089, datetime('now'), datetime('now')),
('city-nissan', 'hc-usa', 'Nashville', 36.1665, -86.7713, datetime('now'), datetime('now')),
('city-azteca', 'hc-mexico', 'Mexico City', 19.3030, -99.1504, datetime('now'), datetime('now')),
('city-bbva', 'hc-mexico', 'Monterrey', 25.6700, -100.2444, datetime('now'), datetime('now'));

-- 4. Stadiums
INSERT OR IGNORE INTO Stadium (id, hostCityId, tournamentId, name, address, capacity, latitude, longitude, timezone, imageUrl, isDeleted, createdAt, updatedAt) VALUES
('metlife', 'city-metlife', 't-2026', 'MetLife Stadium', '1 MetLife Stadium Dr, East Rutherford, NJ', 82500, 40.8135, -74.0745, 'America/New_York', NULL, 0, datetime('now'), datetime('now')),
('sofi', 'city-sofi', 't-2026', 'SoFi Stadium', '1001 S Stadium Dr, Inglewood, CA', 70240, 33.9534, -118.3387, 'America/Los_Angeles', NULL, 0, datetime('now'), datetime('now')),
('att', 'city-att', 't-2026', 'AT&T Stadium', '1 AT&T Way, Arlington, TX', 80000, 32.7473, -97.0945, 'America/Chicago', NULL, 0, datetime('now'), datetime('now')),
('arrowhead', 'city-arrowhead', 't-2026', 'Arrowhead Stadium', '1 Arrowhead Dr, Kansas City, MO', 76416, 39.0489, -94.4839, 'America/Chicago', NULL, 0, datetime('now'), datetime('now')),
('hard-rock', 'city-hardrock', 't-2026', 'Hard Rock Stadium', '347 Don Shula Dr, Miami Gardens, FL', 65326, 25.9580, -80.2389, 'America/New_York', NULL, 0, datetime('now'), datetime('now')),
('lincoln', 'city-lincoln', 't-2026', 'Lincoln Financial Field', '1 Lincoln Financial Field Way, Philadelphia, PA', 69796, 39.9008, -75.1675, 'America/New_York', NULL, 0, datetime('now'), datetime('now')),
('levi', 'city-levi', 't-2026', 'Levi''s Stadium', '4900 Marie P DeBartolo Way, Santa Clara, CA', 71620, 37.4033, -121.9698, 'America/Los_Angeles', NULL, 0, datetime('now'), datetime('now')),
('gillette', 'city-gillette', 't-2026', 'Gillette Stadium', '1 Patriot Pl, Foxborough, MA', 65878, 42.0909, -71.2643, 'America/New_York', NULL, 0, datetime('now'), datetime('now')),
('nrg', 'city-nrg', 't-2026', 'NRG Stadium', '1 NRG Park, Houston, TX', 72220, 29.6847, -95.4107, 'America/Chicago', NULL, 0, datetime('now'), datetime('now')),
('mercedes-benz', 'city-mb', 't-2026', 'Mercedes-Benz Stadium', '1 AMB Dr NW, Atlanta, GA', 71000, 33.7554, -84.4010, 'America/New_York', NULL, 0, datetime('now'), datetime('now')),
('lumen', 'city-lumen', 't-2026', 'Lumen Field', '3333 Occidental Ave S, Seattle, WA', 68740, 47.5952, -122.3316, 'America/Los_Angeles', NULL, 0, datetime('now'), datetime('now')),
('bmo', 'city-bmo', 't-2026', 'BMO Stadium', '3939 S Figueroa St, Los Angeles, CA', 22000, 34.0128, -118.2841, 'America/Los_Angeles', NULL, 0, datetime('now'), datetime('now')),
('bc-place', 'city-bc', 't-2026', 'BC Place', '777 Pacific Blvd, Vancouver, BC', 54500, 49.2778, -123.1089, 'America/Vancouver', NULL, 0, datetime('now'), datetime('now')),
('nissan', 'city-nissan', 't-2026', 'Nissan Stadium', '1 Titans Way, Nashville, TN', 69143, 36.1665, -86.7713, 'America/Chicago', NULL, 0, datetime('now'), datetime('now')),
('azteca', 'city-azteca', 't-2026', 'Estadio Azteca', 'Canteros s/n, Santa Úrsula, Mexico City', 87523, 19.3030, -99.1504, 'America/Mexico_City', NULL, 0, datetime('now'), datetime('now')),
('bbva', 'city-bbva', 't-2026', 'Estadio BBVA', 'Av. Pablo Livas 2001, Santa Catarina, Monterrey', 53500, 25.6700, -100.2444, 'America/Monterrey', NULL, 0, datetime('now'), datetime('now'));

-- 5. Fix stadium-1
UPDATE Stadium SET hostCityId = 'city-metlife', tournamentId = 't-2026' WHERE id = 'stadium-1';

-- 6. System user (already exists, INSERT OR IGNORE will skip)
INSERT OR IGNORE INTO StaffUser (id, email, name, passwordHash, role, isDeleted, createdAt, updatedAt) VALUES ('system', 'system@stadiumos.com', 'System', '$2a$10$placeholder', 'super_admin', 0, datetime('now'), datetime('now'));

-- 7. Seed incidents (only if < 5 exist)
INSERT OR IGNORE INTO Incident (id, stadiumId, type, severity, status, title, description, locationDesc, escalationLevel, isDeleted, reportedById, reportedAt, updatedAt) VALUES
('seed-inc-001', 'metlife', 'crowd_control', 'critical', 'reported', 'Crowd surge at Gate B North', 'High crowd density detected at Gate B North entrance. Fans pushing against barriers.', 'Gate B North', 0, 0, 'system', datetime('now', '-15 minutes'), datetime('now', '-15 minutes')),
('seed-inc-002', 'metlife', 'medical', 'high', 'acknowledged', 'Fan collapsed in Section 114', 'Female fan collapsed due to heat exhaustion. Medical team en route.', 'Section 114', 0, 0, 'system', datetime('now', '-45 minutes'), datetime('now', '-30 minutes')),
('seed-inc-003', 'sofi', 'vendor', 'medium', 'in_progress', 'Hot dog stands depleted in Concourse C', 'All hot dog and beverage vendors in Concourse C have run out of stock.', 'Concourse C', 0, 0, 'system', datetime('now', '-2 hours'), datetime('now', '-40 minutes')),
('seed-inc-004', 'att', 'equipment', 'low', 'resolved', 'CCTV Camera #47 offline', 'Camera 47 in parking lot B3 went offline at 14:32.', 'Parking B3', 0, 0, 'system', datetime('now', '-3 hours'), datetime('now', '-2 hours')),
('seed-inc-005', 'metlife', 'security', 'critical', 'escalated', 'Unauthorized drone over stadium', 'Unidentified drone spotted hovering over the east stand.', 'East Stand', 2, 0, 'system', datetime('now', '-12 minutes'), datetime('now', '-5 minutes')),
('seed-inc-006', 'sofi', 'crowd_control', 'high', 'reported', 'Gate A3 overcrowding — 45min wait', 'Gate A3 experiencing extreme congestion. Only 2 of 4 scanners operational.', 'Gate A3', 0, 0, 'system', datetime('now', '-20 minutes'), datetime('now', '-18 minutes')),
('seed-inc-007', 'hard-rock', 'weather', 'medium', 'acknowledged', 'Lightning detected — 8mi radius', 'Lightning strike detected 8 miles from stadium.', 'All areas', 0, 0, 'system', datetime('now', '-30 minutes'), datetime('now', '-24 minutes')),
('seed-inc-008', 'att', 'crowd_control', 'high', 'in_progress', 'Missing child — Section 205', 'Parent reported 8-year-old son missing in Section 205.', 'Section 205', 1, 0, 'system', datetime('now', '-10 minutes'), datetime('now', '-6 minutes')),
('seed-inc-009', 'metlife', 'infrastructure', 'medium', 'acknowledged', 'Restroom block D — plumbing failure', 'Restroom block D experiencing plumbing failure.', 'Concourse D', 0, 0, 'system', datetime('now', '-50 minutes'), datetime('now', '-38 minutes')),
('seed-inc-010', 'metlife', 'accessibility', 'high', 'reported', 'Wheelchair user stuck in elevator E2', 'Wheelchair-bound fan stuck in elevator E2 between levels 2 and 3.', 'Elevator E2', 0, 0, 'system', datetime('now', '-5 minutes'), datetime('now', '-4 minutes'));

-- 8. Queue snapshots
INSERT OR IGNORE INTO QueueSnapshot (id, stadiumId, queueType, length, waitTime, status, timestamp) VALUES
('qs-acc-1', 'metlife', 'accessible_entry', 3, 5, 'normal', datetime('now')),
('qs-acc-2', 'sofi', 'accessible_entry', 7, 12, 'elevated', datetime('now')),
('qs-acc-3', 'att', 'accessible_entry', 2, 3, 'normal', datetime('now')),
('qs-acc-4', 'arrowhead', 'accessible_entry', 5, 8, 'normal', datetime('now')),
('qs-acc-5', 'metlife', 'entry_gate', 15, 18, 'congested', datetime('now')),
('qs-acc-6', 'sofi', 'entry_gate', 22, 25, 'critical', datetime('now')),
('qs-acc-7', 'att', 'entry_gate', 10, 10, 'elevated', datetime('now'));
