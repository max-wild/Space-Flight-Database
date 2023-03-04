SELECT mission_id, name, description, DATE_FORMAT(launch_date, "%Y-%m-%d") AS launch_date, 
successful_completion, organization_id

FROM Missions;