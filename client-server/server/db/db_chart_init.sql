CREATE TABLE "chartOptions"
(
    "id"                   INTEGER   UNIQUE  NOT NULL   PRIMARY KEY,
    "langOrSpec"           TEXT              NOT NULL   DEFAULT "JavaScript",
    "cities"               TEXT,
    "selectedAll"          INTEGER           NOT NULL   DEFAULT 0
)