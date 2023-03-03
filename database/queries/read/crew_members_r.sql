SELECT crew_member_id, first_name, last_name, birth_country, 
DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date, home_base_lead

FROM Crew_Members;