SELECT m.name as mission_name, cm.first_name, cm.last_name

FROM Missions_Crew_Members

JOIN Missions as m ON m.mission_id = Missions_Crew_Members.mission_id

JOIN Crew_Members as cm ON cm.crew_member_id = Missions_Crew_Members.crew_member_id;

-- Group by
-- Order by