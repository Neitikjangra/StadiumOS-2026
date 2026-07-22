SELECT 'Incident' as tbl, count(*) as cnt FROM "Incident"
UNION ALL SELECT 'Gate', count(*) FROM "Gate"
UNION ALL SELECT 'Zone', count(*) FROM "Zone"
UNION ALL SELECT 'QueueSnapshot', count(*) FROM "QueueSnapshot"
UNION ALL SELECT 'Anomaly', count(*) FROM "Anomaly"
UNION ALL SELECT 'Notification', count(*) FROM "Notification"
UNION ALL SELECT 'TransitUpdate', count(*) FROM "TransitUpdate"
UNION ALL SELECT 'AccessibilityService', count(*) FROM "AccessibilityService"
UNION ALL SELECT 'Match', count(*) FROM "Match"
UNION ALL SELECT 'Stadium', count(*) FROM "Stadium"
UNION ALL SELECT 'StandardOperatingProcedure', count(*) FROM "StandardOperatingProcedure"
UNION ALL SELECT 'Device', count(*) FROM "Device"
UNION ALL SELECT 'WorkforceAllocation', count(*) FROM "WorkforceAllocation"
UNION ALL SELECT 'ShiftHandoff', count(*) FROM "ShiftHandoff"
UNION ALL SELECT 'User', count(*) FROM "User"
UNION ALL SELECT 'AuditLog', count(*) FROM "AuditLog"
UNION ALL SELECT 'Alert', count(*) FROM "Alert"
UNION ALL SELECT 'KnowledgeDocument', count(*) FROM "KnowledgeDocument";

SELECT '---Incidents with escalationLevel >= 1---' as info;
SELECT id, type, escalationLevel FROM "Incident" LIMIT 20;

SELECT '---Distinct queueType from QueueSnapshot---' as info;
SELECT DISTINCT queueType FROM "QueueSnapshot";

SELECT '---Distinct type from Notification---' as info;
SELECT DISTINCT type FROM "Notification";

SELECT '---Distinct status from TransitUpdate---' as info;
SELECT DISTINCT status FROM "TransitUpdate";

SELECT '---Distinct type from Anomaly---' as info;
SELECT DISTINCT type FROM "Anomaly";
