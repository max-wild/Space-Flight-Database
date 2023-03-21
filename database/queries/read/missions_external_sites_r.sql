SELECT m.name as mission_name, m.mission_id, es.name as external_site_name, es.external_site_id

FROM Missions_External_Sites

JOIN Missions as m ON m.mission_id = Missions_External_Sites.mission_id

JOIN External_Sites as es ON es.external_site_id = Missions_External_Sites.external_site_id

-- GROUP BY m.name
ORDER BY m.mission_id ASC;