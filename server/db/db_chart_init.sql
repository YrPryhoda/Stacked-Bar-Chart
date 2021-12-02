CREATE TABLE "chartOptions"
(
    "id"                   INTEGER   UNIQUE  NOT NULL   PRIMARY KEY,
    "langOrSpec"           TEXT              NOT NULL   DEFAULT "JavaScript",
    "cities"               TEXT                         DEFAULT NULL
)