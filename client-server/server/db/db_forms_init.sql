CREATE TABLE "forms"
(
    "id"                 INTEGER UNIQUE         NOT NULL,
    "city"               TEXT                   NOT NULL,
    "salary"             INTEGER                NOT NULL,
    "salaryChange"       INTEGER,
    "position"           CHARACTER              NOT NULL,
    "experience"         NUMERIC                NOT NULL,
    "current_job_exp"    NUMERIC,
    "language"           CHARACTER,
    "specialization"     CHARACTER,
    "age"                INTEGER,
    "sex"                CHARACTER              NOT NULL,
    "degree"             TEXT,
    "university"         TEXT,
    "isStudent"          INTEGER                NOT NULL        DEFAULT 0,
    "englishLevel"       CHARACTER,
    "companySize"        CHARACTER,
    "companyType"        CHARACTER,
    "subject"            TEXT
)