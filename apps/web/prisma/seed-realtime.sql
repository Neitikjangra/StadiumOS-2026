-- WeatherSnapshot: One per stadium, realistic summer 2026 World Cup weather
-- USA venues: hot, varied humidity
-- Mexico venues: warm, moderate humidity
-- Canada venues: mild

INSERT INTO WeatherSnapshot (id, stadiumId, temperature, humidity, windSpeed, conditions, alerts, uvIndex, timestamp)
VALUES
  -- MetLife Stadium (East Rutherford, NJ) - hot & humid summer
  ('ws-001', 'metlife', 31.2, 72.5, 14.0, 'Hot & Humid', '[]', 8, datetime('now', '-10 minutes')),
  -- SoFi Stadium (Inglewood, CA) - warm, dry California
  ('ws-002', 'sofi', 28.8, 45.3, 8.5, 'Sunny', '[]', 9, datetime('now', '-10 minutes')),
  -- AT&T Stadium (Arlington, TX) - hot Texas summer
  ('ws-003', 'att', 34.5, 58.0, 11.2, 'Clear & Hot', '[]', 9, datetime('now', '-10 minutes')),
  -- Arrowhead Stadium (Kansas City, MO) - warm Midwest summer
  ('ws-004', 'arrowhead', 30.1, 62.8, 16.5, 'Partly Cloudy', '[]', 7, datetime('now', '-10 minutes')),
  -- Mercedes-Benz Stadium (Atlanta, GA) - hot & humid Southeast
  ('ws-005', 'mercedes-benz', 32.4, 70.1, 9.3, 'Thunderstorms Possible', '["Heat advisory in effect"]', 7, datetime('now', '-10 minutes')),
  -- NRG Stadium (Houston, TX) - hot & very humid Gulf Coast
  ('ws-006', 'nrg', 33.8, 75.2, 7.8, 'Hot & Muggy', '["Heat index 39C"]', 8, datetime('now', '-10 minutes')),
  -- Hard Rock Stadium (Miami Gardens, FL) - tropical heat
  ('ws-007', 'hard-rock', 32.0, 78.4, 12.1, 'Partly Cloudy', '[]', 9, datetime('now', '-10 minutes')),
  -- Lincoln Financial Field (Philadelphia, PA) - warm Mid-Atlantic
  ('ws-008', 'lincoln', 29.7, 65.0, 13.4, 'Mostly Sunny', '[]', 7, datetime('now', '-10 minutes')),
  -- Lumen Field (Seattle, WA) - mild Pacific Northwest
  ('ws-009', 'lumen', 23.5, 55.8, 18.2, 'Clear', '[]', 6, datetime('now', '-10 minutes')),
  -- Levi''s Stadium (Santa Clara, CA) - mild Bay Area
  ('ws-010', 'levi', 25.0, 50.2, 15.0, 'Sunny', '[]', 8, datetime('now', '-10 minutes')),
  -- Gillette Stadium (Foxborough, MA) - warm New England
  ('ws-011', 'gillette', 27.3, 60.5, 14.8, 'Partly Cloudy', '[]', 6, datetime('now', '-10 minutes')),
  -- BMO Field (Toronto, ON) - mild Canadian summer
  ('ws-012', 'bmo', 24.8, 58.3, 12.0, 'Mostly Sunny', '[]', 6, datetime('now', '-10 minutes')),
  -- Estadio Azteca (Mexico City, MX) - high altitude, warm
  ('ws-013', 'azteca', 24.0, 52.0, 10.5, 'Partly Cloudy', '[]', 9, datetime('now', '-10 minutes')),
  -- Estadio BBVA (Monterrey, MX) - hot northern Mexico
  ('ws-014', 'bbva', 33.2, 55.8, 8.0, 'Clear & Hot', '[]', 10, datetime('now', '-10 minutes')),
  -- BC Place (Vancouver, BC) - mild Pacific Canada
  ('ws-015', 'bc-place', 21.5, 62.0, 16.8, 'Overcast', '[]', 4, datetime('now', '-10 minutes')),
  -- Nissan Stadium (Nashville, TN) - hot Southeast interior
  ('ws-016', 'nissan', 32.8, 68.5, 10.0, 'Hot & Humid', '["Heat advisory in effect"]', 8, datetime('now', '-10 minutes'));

-- IncidentUpdate: 1-2 updates per incident with realistic comments
-- Using existing staff user IDs and incident statuses

INSERT INTO IncidentUpdate (id, incidentId, userId, content, oldStatus, newStatus, timestamp)
VALUES
  -- inc-1: in_progress
  ('iu-001', 'inc-1', 'op-3', 'Initial report received. Team dispatched to assess the situation.', 'reported', 'acknowledged', datetime('now', '-2 hours')),
  ('iu-002', 'inc-1', 'op-3', 'Assessment complete. Crowd density exceeding safe thresholds in Section 112. Additional security staff deployed.', 'acknowledged', 'in_progress', datetime('now', '-1 hour')),

  -- inc-2: escalated
  ('iu-003', 'inc-2', 'op-4', 'Medical emergency reported near Gate B. First aid team en route.', 'reported', 'acknowledged', datetime('now', '-3 hours')),
  ('iu-004', 'inc-2', 'op-4', 'Patient requires advanced medical attention. Ambulance dispatched. Escalating to operations lead.', 'acknowledged', 'escalated', datetime('now', '-2 hours')),

  -- inc-3: acknowledged
  ('iu-005', 'inc-3', 'op-5', 'Suspicious package reported at Concourse Level 2. Security perimeter established.', 'reported', 'acknowledged', datetime('now', '-90 minutes')),

  -- inc-4: closed
  ('iu-006', 'inc-4', 'op-2', 'Equipment malfunction logged. Maintenance team notified.', 'reported', 'acknowledged', datetime('now', '-4 hours')),
  ('iu-007', 'inc-4', 'op-2', 'Repair completed. System back online. No further action required.', 'acknowledged', 'in_progress', datetime('now', '-3 hours')),
  ('iu-008', 'inc-4', 'op-2', 'Issue resolved. Equipment operating normally. Closing incident.', 'in_progress', 'closed', datetime('now', '-2 hours')),

  -- inc-5: acknowledged
  ('iu-009', 'inc-5', 'op-3', 'Fan disturbance reported in Lower Bowl Section 205. Security responding.', 'reported', 'acknowledged', datetime('now', '-45 minutes')),

  -- inc-6: in_progress
  ('iu-010', 'inc-6', 'op-5', 'Weather alert: Lightning detected 8 miles from venue. Monitoring conditions.', 'reported', 'acknowledged', datetime('now', '-50 minutes')),
  ('iu-011', 'inc-6', 'op-5', 'Storm system approaching. Preparing contingency measures for outdoor areas.', 'acknowledged', 'in_progress', datetime('now', '-30 minutes')),

  -- inc-7: acknowledged
  ('iu-012', 'inc-7', 'op-4', 'VIP area access issue reported. Investigating credential system.', 'reported', 'acknowledged', datetime('now', '-1 hour')),

  -- inc-8: in_progress
  ('iu-013', 'inc-8', 'op-3', 'Crowd control issue at Main Entrance. Gate throughput低于 expected.', 'reported', 'acknowledged', datetime('now', '-80 minutes')),
  ('iu-014', 'inc-8', 'op-3', 'Opening additional screening lanes. Estimated resolution in 10 minutes.', 'acknowledged', 'in_progress', datetime('now', '-60 minutes')),

  -- inc-9: in_progress
  ('iu-015', 'inc-9', 'op-2', 'Infrastructure concern: Section 14 concourse lighting failure.', 'reported', 'acknowledged', datetime('now', '-2 hours')),
  ('iu-016', 'inc-9', 'op-2', 'Backup lighting activated. Electrician dispatched for permanent repair.', 'acknowledged', 'in_progress', datetime('now', '-1 hour')),

  -- inc-10: acknowledged
  ('iu-017', 'inc-10', 'op-5', 'Accessibility elevator out of service at Gate C. Temporary ramp deployed.', 'reported', 'acknowledged', datetime('now', '-3 hours')),

  -- inc-11: escalated
  ('iu-018', 'inc-11', 'op-4', 'Fire alarm triggered in Concourse Level 3. Evacuation protocol under review.', 'reported', 'acknowledged', datetime('now', '-2 hours')),
  ('iu-019', 'inc-11', 'op-4', 'False alarm confirmed — sensor malfunction. However, escalating for sensor fleet inspection.', 'acknowledged', 'escalated', datetime('now', '-1 hour')),

  -- inc-12: escalated
  ('iu-020', 'inc-12', 'op-3', 'Vendor dispute at Food Court B. Fan confrontation escalating.', 'reported', 'acknowledged', datetime('now', '-40 minutes')),
  ('iu-021', 'inc-12', 'op-3', 'Situation escalating. Security backup requested. Crowd management alert issued.', 'acknowledged', 'escalated', datetime('now', '-20 minutes')),

  -- inc-13: resolved
  ('iu-022', 'inc-13', 'op-2', 'Restroom maintenance issue in Block 300. Cleaning crew dispatched.', 'reported', 'acknowledged', datetime('now', '-3 hours')),
  ('iu-023', 'inc-13', 'op-2', 'Maintenance completed. Restroom fully operational.', 'acknowledged', 'in_progress', datetime('now', '-2 hours')),
  ('iu-024', 'inc-13', 'op-2', 'Issue resolved. Closing incident.', 'in_progress', 'resolved', datetime('now', '-1 hour')),

  -- inc-14: resolved
  ('iu-025', 'inc-14', 'op-5', 'Communication system intermittent failure on PA Zone 4.', 'reported', 'acknowledged', datetime('now', '-5 hours')),
  ('iu-026', 'inc-14', 'op-5', 'Backup comms channel activated. Primary system being reset.', 'acknowledged', 'in_progress', datetime('now', '-4 hours')),
  ('iu-027', 'inc-14', 'op-5', 'System restored. All PA zones operational.', 'in_progress', 'resolved', datetime('now', '-3 hours')),

  -- inc-15: acknowledged
  ('iu-028', 'inc-15', 'op-3', 'Parking Lot C congestion building. Traffic management team alerted.', 'reported', 'acknowledged', datetime('now', '-1 hour')),

  -- inc-16: resolved
  ('iu-029', 'inc-16', 'op-2', 'Signage error on Digital Board 7. Content team notified.', 'reported', 'acknowledged', datetime('now', '-2 hours')),
  ('iu-030', 'inc-16', 'op-2', 'Content corrected and re-uploaded. Signage displaying correctly.', 'acknowledged', 'resolved', datetime('now', '-1 hour')),

  -- inc-17: closed
  ('iu-031', 'inc-17', 'op-4', 'Minor crowd control adjustment needed at Gate D exit.', 'reported', 'acknowledged', datetime('now', '-6 hours')),
  ('iu-032', 'inc-17', 'op-4', 'Additional exit staff deployed. Flow normalized.', 'acknowledged', 'in_progress', datetime('now', '-5 hours')),
  ('iu-033', 'inc-17', 'op-4', 'Situation fully resolved. Closing incident.', 'in_progress', 'closed', datetime('now', '-4 hours')),

  -- inc-18: in_progress
  ('iu-034', 'inc-18', 'op-3', 'Transit hub delay: Metro line experiencing 15-minute delays.', 'reported', 'acknowledged', datetime('now', '-70 minutes')),
  ('iu-035', 'inc-18', 'op-3', 'Coordinating with transit authority. Alternative shuttle routes being arranged.', 'acknowledged', 'in_progress', datetime('now', '-45 minutes')),

  -- inc-19: in_progress
  ('iu-036', 'inc-19', 'op-5', 'VIP hospitality suite temperature complaint. HVAC system underperforming.', 'reported', 'acknowledged', datetime('now', '-90 minutes')),
  ('iu-037', 'inc-19', 'op-5', 'HVAC technician on-site. Temporary cooling units deployed to affected suites.', 'acknowledged', 'in_progress', datetime('now', '-60 minutes')),

  -- inc-20: reported
  ('iu-038', 'inc-20', 'op-2', 'Ticket scanning error at Gate A. Multiple passes failing validation.', 'reported', 'reported', datetime('now', '-15 minutes')),

  -- inc-21: acknowledged
  ('iu-039', 'inc-21', 'op-3', 'Medical stand requesting additional supplies. Inventory running low.', 'reported', 'acknowledged', datetime('now', '-2 hours')),

  -- inc-22: acknowledged
  ('iu-040', 'inc-22', 'op-4', 'CCTV camera feed loss at Parking Lot D. Security blind spot identified.', 'reported', 'acknowledged', datetime('now', '-1 hour')),

  -- inc-23: acknowledged
  ('iu-041', 'inc-23', 'op-5', 'Volunteer no-show reported for Gate C shift. Coverage gap identified.', 'reported', 'acknowledged', datetime('now', '-3 hours')),

  -- inc-24: resolved
  ('iu-042', 'inc-24', 'op-2', 'Concession stand running out of stock on key items. Vendor notified.', 'reported', 'acknowledged', datetime('now', '-4 hours')),
  ('iu-043', 'inc-24', 'op-2', 'Emergency restock completed. Inventory levels restored.', 'acknowledged', 'resolved', datetime('now', '-2 hours')),

  -- inc-25: resolved
  ('iu-044', 'inc-25', 'op-4', 'Queue at Security Checkpoint 3 exceeding 20-minute wait threshold.', 'reported', 'acknowledged', datetime('now', '-3 hours')),
  ('iu-045', 'inc-25', 'op-4', 'Additional screening lanes opened. Wait time reduced to normal levels.', 'acknowledged', 'resolved', datetime('now', '-1 hour')),

  -- inc-26: in_progress
  ('iu-046', 'inc-26', 'op-3', 'Noise complaint from VIP suite. Entertainment volume exceeding limits.', 'reported', 'acknowledged', datetime('now', '-50 minutes')),
  ('iu-047', 'inc-26', 'op-3', 'AV team adjusting volume levels. Monitoring for compliance.', 'acknowledged', 'in_progress', datetime('now', '-30 minutes')),

  -- inc-27: closed
  ('iu-048', 'inc-27', 'op-2', 'Elevator B3 out of service. Maintenance team dispatched.', 'reported', 'acknowledged', datetime('now', '-5 hours')),
  ('iu-049', 'inc-27', 'op-2', 'Repair completed. Elevator back in service.', 'acknowledged', 'in_progress', datetime('now', '-4 hours')),
  ('iu-050', 'inc-27', 'op-2', 'Fully operational. Incident closed.', 'in_progress', 'closed', datetime('now', '-3 hours')),

  -- inc-28: closed
  ('iu-051', 'inc-28', 'op-5', 'Lost child reported near Fan Zone. Security and volunteer teams alerted.', 'reported', 'acknowledged', datetime('now', '-7 hours')),
  ('iu-052', 'inc-28', 'op-5', 'Child located and reunited with parents. No further action needed.', 'acknowledged', 'resolved', datetime('now', '-6 hours')),
  ('iu-053', 'inc-28', 'op-5', 'Closing incident. All clear.', 'resolved', 'closed', datetime('now', '-5 hours')),

  -- inc-29: escalated
  ('iu-054', 'inc-29', 'op-4', 'Power fluctuation detected in Operations Center. UPS system engaging.', 'reported', 'acknowledged', datetime('now', '-1 hour')),
  ('iu-055', 'inc-29', 'op-4', 'Utility company notified. Generator on standby. Escalating for priority response.', 'acknowledged', 'escalated', datetime('now', '-30 minutes')),

  -- inc-30: closed
  ('iu-056', 'inc-30', 'op-3', 'Media credential issue at Press Box entrance. Journalism team lead contacted.', 'reported', 'acknowledged', datetime('now', '-6 hours')),
  ('iu-057', 'inc-30', 'op-3', 'Credentials verified and access granted.', 'acknowledged', 'in_progress', datetime('now', '-5 hours')),
  ('iu-058', 'inc-30', 'op-3', 'Issue resolved. Press access fully restored.', 'in_progress', 'closed', datetime('now', '-4 hours'));
