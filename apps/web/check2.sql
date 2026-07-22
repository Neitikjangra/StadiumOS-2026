.mode column
.headers on
.width 30 25

SELECT '--- QueueSnapshot (5 most recent) ---';
SELECT id, timestamp FROM "QueueSnapshot" ORDER BY timestamp DESC LIMIT 5;

SELECT '';
SELECT '--- AnomalyEvent (first 10) ---';
SELECT id, acknowledged FROM "AnomalyEvent" LIMIT 10;

SELECT '';
SELECT '--- Incident (first 10) ---';
SELECT id, type, severity, status, escalationLevel, reportedAt FROM "Incident" LIMIT 10;

SELECT '';
SELECT '--- TransitUpdate (first 10) ---';
SELECT id, type, status, timestamp FROM "TransitUpdate" LIMIT 10;

SELECT '';
SELECT '--- NotificationCampaign (first 10) ---';
SELECT id, type, title, createdAt FROM "NotificationCampaign" LIMIT 10;
