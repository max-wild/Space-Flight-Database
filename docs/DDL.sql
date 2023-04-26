-- Team Members: Max Wild, Austin Webber
-- Team Name: Query On (Group 74)

-- Disable Foreign Key Checks and Commits
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;


-- -----------------------------------------------------
--
-- SETTING UP TABLES
--
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table Organizations
-- -----------------------------------------------------
CREATE OR REPLACE TABLE Organizations (

    organization_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,

    PRIMARY KEY (organization_id)
);

-- -----------------------------------------------------
-- Table Missions
-- -----------------------------------------------------
CREATE OR REPLACE TABLE Missions (

    mission_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    launch_date DATE NULL,
    successful_completion TINYINT(1) NOT NULL DEFAULT 0,
    -- allowing organization_id to be set to NULL for ON DELETE SET NULL
    organization_id INT NULL,
    
    -- ON DELETE SET NULL will ensure that if an organization is deleted, 
    -- the relevant mission in the Missions table will not be deleted.
    FOREIGN KEY (organization_id) REFERENCES Organizations(organization_id) ON DELETE SET NULL,
    
    PRIMARY KEY (mission_id)
);

-- -----------------------------------------------------
-- Table External_Sites
-- -----------------------------------------------------
CREATE OR REPLACE TABLE External_Sites (

    external_site_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    dist_from_earth INT NULL,

    PRIMARY KEY (external_site_id)
);

-- -----------------------------------------------------
-- Table Crew_Members
-- -----------------------------------------------------
CREATE OR REPLACE TABLE Crew_Members (

    crew_member_id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_country VARCHAR(50) NULL,
    birth_date DATE NULL,
    home_base_lead TINYINT(1) NOT NULL DEFAULT 0,

    PRIMARY KEY (crew_member_id)
);

-- -----------------------------------------------------
-- Table Missions_External_Sites
-- -----------------------------------------------------
CREATE OR REPLACE TABLE Missions_External_Sites (

    mission_id INT NOT NULL,
    external_site_id INT NOT NULL,
    
    -- ON DELETE CASCADE will ensure that when a mission or external site entity is deleted, 
    -- the rows associated with that entity will be deleted from this table too.
    FOREIGN KEY (mission_id) REFERENCES Missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (external_site_id) REFERENCES External_Sites(external_site_id) ON DELETE CASCADE,

    PRIMARY KEY (mission_id, external_site_id)
);

-- -----------------------------------------------------
-- Table Missions_Crew_Members
-- -----------------------------------------------------
CREATE OR REPLACE TABLE Missions_Crew_Members (

    mission_id INT NOT NULL,
    crew_member_id INT NOT NULL,
	
    -- ON DELETE CASCADE will ensure that when a mission or crew member entity is deleted, 
    -- the rows associated with that entity will be deleted from this table too.
    FOREIGN KEY (mission_id) REFERENCES Missions(mission_id) ON DELETE CASCADE,
    FOREIGN KEY (crew_member_id) REFERENCES Crew_Members(crew_member_id) ON DELETE CASCADE,

    PRIMARY KEY (mission_id, crew_member_id)
);


-- -----------------------------------------------------
--
-- INSERTING SAMPLE DATA
--
-- -----------------------------------------------------

INSERT INTO Organizations(name, country)
VALUES 
('The National Aeronautics and Space Administration', 'United States of America'), 
('The Latin American and Caribbean Space Agency', 'Mexico'),
('The South African National Space Agency', 'South Africa'),
('European Space Agency', 'France'),
('The Asia-Pacific Regional Space Agency Forum', 'Beijing'),
('Australian Space Agency', 'Australia');


INSERT INTO Missions(name, description, launch_date, organization_id)
VALUES
("Parkinson Investigation", 
    "A group of astronauts will be sent to the ISS to further observe how Parkinson's
    disease affects brain cells in a zero-G environment.",
    '2026-04-13', 1),
('Life Search on Europa',
    'The core of Europa is warm enough to heat water into liquid form. Scientists will
    travel to Europa to investigate alien life.',
    '2030-02-24', 3),
('Asteroid Belt Mining',
    'In the asteroid belt between Mars, a very large deposit of the rare element Astatine
    been found. An astronaut will lead a robot team to explore.',
    '2033-05-05', 4);


INSERT INTO External_Sites(name, dist_from_earth)
VALUES
('International Space Station', 254),
('Europa', 390000000),
('Asteroid Belt', 111500000);


INSERT INTO Crew_Members(first_name, last_name, birth_country, birth_date, home_base_lead)
VALUES
('Joe', 'Smith', 'Canada', '1980-04-15', 1),
('Angelina', 'Sanchez', 'United States of America', '1992-01-19', 0),
('Abubakar', 'Ajayi', 'United States of America', '1976-11-20', 0),
('Sara', 'Heron', 'Ukraine', '1975-07-02', 0),
('David', 'Volkov', 'Russia', '1989-01-27', 0),
('Faith', 'Khumalo', 'South Africa', '1993-05-14', 0);


INSERT INTO Missions_External_Sites(mission_id, external_site_id)
VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 1),
(3, 3);


INSERT INTO Missions_Crew_Members(mission_id, crew_member_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 2),
(2, 6),
(3, 4),
(3, 5);


SET FOREIGN_KEY_CHECKS=1;
COMMIT;
