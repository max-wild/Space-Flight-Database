SELECT m.mission_id, m.name, m.description, m.launch_date, m.successful_completion, org.name as organization_name

FROM Missions AS m
 
JOIN Organizations AS org ON m.organization_id = org.organization_id;