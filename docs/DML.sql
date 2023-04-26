-- Team Members: Max Wild, Austin Webber
-- Team Name: Query On (Group 74)

-- The at sign @ (e.g., @name) is used throughout to 
-- denote the variables that will have data from the backend programming language

-- ----------------------------------------------
-- INSERT Operand
-- ----------------------------------------------

-- Insert new data into Missions table
INSERT INTO Missions (name, description, launch_date, successful_completion, organization_id) VALUES
(@name, @description, @launch_date, @successful_completion, @organization_id);

-- Insert new data into External_Sites table
INSERT INTO External_Sites (name, dist_from_earth) VALUES
(@name, @dist_from_earth);

-- Insert new data into Crew_Members table
INSERT INTO Crew_Members (first_name, last_name, birth_country, birth_date, home_base_lead) VALUES
(@first_name, @last_name, @birth_country, @birth_date, @home_base_lead);

-- Insert new data into Oranizations table
INSERT INTO Organizations (name, country) VALUES
(@name, @country);

-- Inserting primary and foreign keys into Missions_Crew_Members intersection table
INSERT IGNORE INTO Missions_Crew_Members 
SET mission_id = @mission_id,
crew_member_id = @crew_member_id;

-- Inserting primary and foreign keys into Missions_External_Sites intersection table
INSERT IGNORE INTO Missions_External_Sites 
SET mission_id = @mission_id,
external_site_id = @external_site_id;

-- ----------------------------------------------
-- SELECT Operand
-- ----------------------------------------------

-- Display all data from Missions table
SELECT m.mission_id, m.name, m.description, DATE_FORMAT(m.launch_date, "%Y-%m-%d") AS launch_date, 
m.successful_completion, org.name as organization_name
FROM Missions AS m
LEFT JOIN Organizations AS org ON m.organization_id = org.organization_id;

-- Display all data from Missions without left joining to the Organization
-- (Used for selecting HTML organization_id select element values in the dropdown)
SELECT mission_id, name, description, DATE_FORMAT(launch_date, "%Y-%m-%d") AS launch_date, 
successful_completion, organization_id
FROM Missions;

-- The following name-by-id pairs are used for updating HTML select elements:
-- Display existing organization_id's in a dropdown
SELECT org.organization_id, org.name
FROM Organizations AS org;

-- Desplay mission names in a dropdown
SELECT m.mission_id, m.name
FROM Missions AS m;

-- Display first and last names of crew members in dropdown
SELECT cm.crew_member_id, cm.first_name, cm.last_name
FROM Crew_Members AS cm;

-- Display external sites in a dropdown
SELECT es.external_site_id, es.name
FROM External_Sites AS es;

-- Display Missions_Crew_Members intersection table, but with mission names and crew member first and
-- last names being used for more readable info
SELECT m.name as mission_name, m.mission_id, cm.first_name, cm.last_name, cm.crew_member_id
FROM Missions_Crew_Members
JOIN Missions as m ON m.mission_id = Missions_Crew_Members.mission_id
JOIN Crew_Members as cm ON cm.crew_member_id = Missions_Crew_Members.crew_member_id
ORDER BY m.mission_id ASC;

-- Display Missions_External_Sites intersection table, but with mission names and external site names
-- being used for more readable info
SELECT m.name as mission_name, m.mission_id, es.name as external_site_name, es.external_site_id
FROM Missions_External_Sites
JOIN Missions as m ON m.mission_id = Missions_External_Sites.mission_id
JOIN External_Sites as es ON es.external_site_id = Missions_External_Sites.external_site_id
ORDER BY m.mission_id ASC;

-- Display all data from External_Sites table
SELECT external_site_id, name, FORMAT(dist_from_earth, 0) AS dist_from_earth
FROM External_Sites;

-- Display all data from Crew_Members table
SELECT crew_member_id, first_name, last_name, birth_country, 
DATE_FORMAT(birth_date, "%Y-%m-%d") AS birth_date, home_base_lead
FROM Crew_Members;

-- Display all data from Organizations table
SELECT organization_id, name, country
FROM Organizations;

-- A search bar on the Missions page takes a string input and searches for
-- substrings of it in Missions.names. The LIKE operator compares contents of
-- strings. Along with '%@substring%', any records where "name" at least
-- contains the value "@substring" will be returned.
SELECT m.mission_id, m.name, m.description, 
DATE_FORMAT(m.launch_date, "%Y-%m-%d") AS launch_date, 
m.successful_completion, org.name as organization_name
FROM Missions AS m
LEFT JOIN Organizations AS org ON m.organization_id = org.organization_id
WHERE m.name LIKE "%$@search_keyword%";

-- ----------------------------------------------
-- UPDATE Operand
-- ----------------------------------------------

-- UPDATE row in Missions, otherwise changing nothing for that attribute if relevant field left blank
UPDATE Missions
    SET name = @name, description = @description, launch_date = @launch_date, successful_completion = @successful_completion, organization_id = @organization_id
    WHERE mission_id = @mission_id;

-- UPDATE row in External_Sites, otherwise changing nothing for that attribute if relevant field left blank
UPDATE External_Sites
    SET name = @name, dist_from_earth = @dist_from_earth
    WHERE external_site_id = @external_site_id;

-- UPDATE row in Crew_Members, otherwise changing nothing for that attribute if relevant field left blank
UPDATE Crew_Members
    SET first_name = @first_name, last_name = @last_name, birth_country = @birth_country, birth_date = @birth_date, home_base_lead = @home_base_lead
    WHERE crew_member_id = @crew_member_id;

-- UPDATE row in Organizations, otherwise changing nothing for that attribute if relevant field left blank
UPDATE Organizations
    SET name = @name, country = @country
    WHERE organization_id = @organization_id;

-- ----------------------------------------------
-- DELETE Operand
-- ----------------------------------------------

-- DELETEs whole Mission row which matches the mission_id
DELETE FROM Missions WHERE mission_id = @mission_id;

-- DELETEs whole External_Sites row which matches the external_site_id
DELETE FROM External_Sites WHERE external_site_id = @external_site_id;

-- DELETEs whole Crew_Members row which matches the crew_member_id
DELETE FROM Crew_Members WHERE crew_member_id = @crew_member_id;

-- DELETEs whole Organization row which matches the organization_id
DELETE FROM Organizations WHERE organization_id = @organization_id;

-- DELETEs specifed crew member from specified mission
DELETE FROM Missions_Crew_Members WHERE mission_id = @mission_id AND crew_member_id = @crew_member_id;

-- DELETEs specifed external site from specified mission
DELETE FROM Missions_External_Sites WHERE mission_id = @mission_id AND external_site_id = @external_site_id;