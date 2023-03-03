SELECT m.name as mission_name, es.name as external_site_name

FROM Missions_External_Sites

JOIN Missions as m ON m.mission_id = Missions_External_Sites.mission_id

JOIN External_Sites as es ON es.external_site_id = Missions_External_Sites.external_site_id;

-- Group by
-- Order by