SELECT m.name as mission_name, m.mission_id, cm.first_name, cm.last_name, cm.crew_member_id

FROM Missions_Crew_Members

JOIN Missions as m ON m.mission_id = Missions_Crew_Members.mission_id

JOIN Crew_Members as cm ON cm.crew_member_id = Missions_Crew_Members.crew_member_id

-- GROUP BY m.name
ORDER BY m.mission_id ASC;