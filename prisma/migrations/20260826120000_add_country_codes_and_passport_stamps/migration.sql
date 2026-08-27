-- Country names become ISO 3166-1 alpha-2 codes, and every arrival becomes a
-- passport stamp. The mapping table below is generated from
-- src/modules/countries/data/countries.data.json and dropped at the end.

-- AlterEnum
ALTER TYPE "Continent" ADD VALUE 'antarctica' BEFORE 'asia';

CREATE TABLE "_country_code_map" (
    "name" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    CONSTRAINT "_country_code_map_pkey" PRIMARY KEY ("name")
);

INSERT INTO "_country_code_map" ("name", "code") VALUES
  ('Afghanistan', 'AF'),
  ('Albania', 'AL'),
  ('Algeria', 'DZ'),
  ('American Samoa', 'AS'),
  ('Andorra', 'AD'),
  ('Angola', 'AO'),
  ('Anguilla', 'AI'),
  ('Antarctica', 'AQ'),
  ('Antigua & Barbuda', 'AG'),
  ('Argentina', 'AR'),
  ('Armenia', 'AM'),
  ('Aruba', 'AW'),
  ('Australia', 'AU'),
  ('Austria', 'AT'),
  ('Azerbaijan', 'AZ'),
  ('Bahamas', 'BS'),
  ('Bahrain', 'BH'),
  ('Bangladesh', 'BD'),
  ('Barbados', 'BB'),
  ('Belarus', 'BY'),
  ('Belgium', 'BE'),
  ('Belize', 'BZ'),
  ('Benin', 'BJ'),
  ('Bermuda', 'BM'),
  ('Bhutan', 'BT'),
  ('Bolivia', 'BO'),
  ('Bosnia & Herzegovina', 'BA'),
  ('Botswana', 'BW'),
  ('Bouvet Island', 'BV'),
  ('Brazil', 'BR'),
  ('British Indian Ocean Territory', 'IO'),
  ('British Virgin Islands', 'VG'),
  ('Brunei', 'BN'),
  ('Bulgaria', 'BG'),
  ('Burkina Faso', 'BF'),
  ('Burma', 'MM'),
  ('Burundi', 'BI'),
  ('Cabo Verde', 'CV'),
  ('Cambodia', 'KH'),
  ('Cameroon', 'CM'),
  ('Canada', 'CA'),
  ('Cape Verde', 'CV'),
  ('Caribbean Netherlands', 'BQ'),
  ('Cayman Islands', 'KY'),
  ('Central African Republic', 'CF'),
  ('Chad', 'TD'),
  ('Chile', 'CL'),
  ('China', 'CN'),
  ('Christmas Island', 'CX'),
  ('Cocos (Keeling) Islands', 'CC'),
  ('Colombia', 'CO'),
  ('Comoros', 'KM'),
  ('Congo - Brazzaville', 'CG'),
  ('Congo - Kinshasa', 'CD'),
  ('Cook Islands', 'CK'),
  ('Costa Rica', 'CR'),
  ('Croatia', 'HR'),
  ('Cuba', 'CU'),
  ('Curaçao', 'CW'),
  ('Cyprus', 'CY'),
  ('Czech Republic', 'CZ'),
  ('Czechia', 'CZ'),
  ('Côte d’Ivoire', 'CI'),
  ('Denmark', 'DK'),
  ('Djibouti', 'DJ'),
  ('Dominica', 'DM'),
  ('Dominican Republic', 'DO'),
  ('East Timor', 'TL'),
  ('Ecuador', 'EC'),
  ('Egypt', 'EG'),
  ('El Salvador', 'SV'),
  ('Equatorial Guinea', 'GQ'),
  ('Eritrea', 'ER'),
  ('Estonia', 'EE'),
  ('Eswatini', 'SZ'),
  ('Ethiopia', 'ET'),
  ('Falkland Islands', 'FK'),
  ('Faroe Islands', 'FO'),
  ('Fiji', 'FJ'),
  ('Finland', 'FI'),
  ('France', 'FR'),
  ('French Guiana', 'GF'),
  ('French Polynesia', 'PF'),
  ('French Southern Territories', 'TF'),
  ('Gabon', 'GA'),
  ('Gambia', 'GM'),
  ('Georgia', 'GE'),
  ('Germany', 'DE'),
  ('Ghana', 'GH'),
  ('Gibraltar', 'GI'),
  ('Greece', 'GR'),
  ('Greenland', 'GL'),
  ('Grenada', 'GD'),
  ('Guadeloupe', 'GP'),
  ('Guam', 'GU'),
  ('Guatemala', 'GT'),
  ('Guernsey', 'GG'),
  ('Guinea', 'GN'),
  ('Guinea-Bissau', 'GW'),
  ('Guyana', 'GY'),
  ('Haiti', 'HT'),
  ('Heard & McDonald Islands', 'HM'),
  ('Holy See', 'VA'),
  ('Honduras', 'HN'),
  ('Hong Kong SAR China', 'HK'),
  ('Hungary', 'HU'),
  ('Iceland', 'IS'),
  ('India', 'IN'),
  ('Indonesia', 'ID'),
  ('Iran', 'IR'),
  ('Iraq', 'IQ'),
  ('Ireland', 'IE'),
  ('Isle of Man', 'IM'),
  ('Israel', 'IL'),
  ('Italy', 'IT'),
  ('Ivory Coast', 'CI'),
  ('Jamaica', 'JM'),
  ('Japan', 'JP'),
  ('Jersey', 'JE'),
  ('Jordan', 'JO'),
  ('Kazakhstan', 'KZ'),
  ('Kenya', 'KE'),
  ('Kiribati', 'KI'),
  ('Kuwait', 'KW'),
  ('Kyrgyzstan', 'KG'),
  ('Laos', 'LA'),
  ('Latvia', 'LV'),
  ('Lebanon', 'LB'),
  ('Lesotho', 'LS'),
  ('Liberia', 'LR'),
  ('Libya', 'LY'),
  ('Liechtenstein', 'LI'),
  ('Lithuania', 'LT'),
  ('Luxembourg', 'LU'),
  ('Macao SAR China', 'MO'),
  ('Macedonia', 'MK'),
  ('Madagascar', 'MG'),
  ('Malawi', 'MW'),
  ('Malaysia', 'MY'),
  ('Maldives', 'MV'),
  ('Mali', 'ML'),
  ('Malta', 'MT'),
  ('Marshall Islands', 'MH'),
  ('Martinique', 'MQ'),
  ('Mauritania', 'MR'),
  ('Mauritius', 'MU'),
  ('Mayotte', 'YT'),
  ('Mexico', 'MX'),
  ('Micronesia', 'FM'),
  ('Moldova', 'MD'),
  ('Monaco', 'MC'),
  ('Mongolia', 'MN'),
  ('Montenegro', 'ME'),
  ('Montserrat', 'MS'),
  ('Morocco', 'MA'),
  ('Mozambique', 'MZ'),
  ('Myanmar (Burma)', 'MM'),
  ('Namibia', 'NA'),
  ('Nauru', 'NR'),
  ('Nepal', 'NP'),
  ('Netherlands', 'NL'),
  ('New Caledonia', 'NC'),
  ('New Zealand', 'NZ'),
  ('Nicaragua', 'NI'),
  ('Niger', 'NE'),
  ('Nigeria', 'NG'),
  ('Niue', 'NU'),
  ('Norfolk Island', 'NF'),
  ('North Korea', 'KP'),
  ('North Macedonia', 'MK'),
  ('Northern Mariana Islands', 'MP'),
  ('Norway', 'NO'),
  ('Oman', 'OM'),
  ('Pakistan', 'PK'),
  ('Palau', 'PW'),
  ('Palestine', 'PS'),
  ('Palestinian Territories', 'PS'),
  ('Panama', 'PA'),
  ('Papua New Guinea', 'PG'),
  ('Paraguay', 'PY'),
  ('Peru', 'PE'),
  ('Philippines', 'PH'),
  ('Pitcairn Islands', 'PN'),
  ('Poland', 'PL'),
  ('Portugal', 'PT'),
  ('Puerto Rico', 'PR'),
  ('Qatar', 'QA'),
  ('Romania', 'RO'),
  ('Russia', 'RU'),
  ('Rwanda', 'RW'),
  ('Réunion', 'RE'),
  ('Samoa', 'WS'),
  ('San Marino', 'SM'),
  ('Saudi Arabia', 'SA'),
  ('Senegal', 'SN'),
  ('Serbia', 'RS'),
  ('Seychelles', 'SC'),
  ('Sierra Leone', 'SL'),
  ('Singapore', 'SG'),
  ('Sint Maarten', 'SX'),
  ('Slovakia', 'SK'),
  ('Slovenia', 'SI'),
  ('Solomon Islands', 'SB'),
  ('Somalia', 'SO'),
  ('South Africa', 'ZA'),
  ('South Georgia & South Sandwich Islands', 'GS'),
  ('South Korea', 'KR'),
  ('South Sudan', 'SS'),
  ('Spain', 'ES'),
  ('Sri Lanka', 'LK'),
  ('St. Barthélemy', 'BL'),
  ('St. Helena', 'SH'),
  ('St. Kitts & Nevis', 'KN'),
  ('St. Lucia', 'LC'),
  ('St. Martin', 'MF'),
  ('St. Pierre & Miquelon', 'PM'),
  ('St. Vincent & Grenadines', 'VC'),
  ('Sudan', 'SD'),
  ('Suriname', 'SR'),
  ('Svalbard & Jan Mayen', 'SJ'),
  ('Swaziland', 'SZ'),
  ('Sweden', 'SE'),
  ('Switzerland', 'CH'),
  ('Syria', 'SY'),
  ('São Tomé & Príncipe', 'ST'),
  ('Taiwan', 'TW'),
  ('Tajikistan', 'TJ'),
  ('Tanzania', 'TZ'),
  ('Thailand', 'TH'),
  ('Timor-Leste', 'TL'),
  ('Togo', 'TG'),
  ('Tokelau', 'TK'),
  ('Tonga', 'TO'),
  ('Trinidad & Tobago', 'TT'),
  ('Tunisia', 'TN'),
  ('Turkey', 'TR'),
  ('Turkmenistan', 'TM'),
  ('Turks & Caicos Islands', 'TC'),
  ('Tuvalu', 'TV'),
  ('Türkiye', 'TR'),
  ('U.S. Outlying Islands', 'UM'),
  ('U.S. Virgin Islands', 'VI'),
  ('Uganda', 'UG'),
  ('Ukraine', 'UA'),
  ('United Arab Emirates', 'AE'),
  ('United Kingdom', 'GB'),
  ('United States', 'US'),
  ('United States of America', 'US'),
  ('Uruguay', 'UY'),
  ('Uzbekistan', 'UZ'),
  ('Vanuatu', 'VU'),
  ('Vatican', 'VA'),
  ('Vatican City', 'VA'),
  ('Venezuela', 'VE'),
  ('Vietnam', 'VN'),
  ('Wallis & Futuna', 'WF'),
  ('Western Sahara', 'EH'),
  ('Yemen', 'YE'),
  ('Zambia', 'ZM'),
  ('Zimbabwe', 'ZW'),
  ('Åland Islands', 'AX');

DO $$
DECLARE
    unmapped TEXT;
BEGIN
    SELECT string_agg(DISTINCT value, ', ') INTO unmapped
    FROM (
        SELECT a."country" AS value FROM "airport" a
        UNION
        SELECT s."country" AS value FROM "user_stats_by_airport" s
    ) stored
    WHERE value NOT IN (SELECT "name" FROM "_country_code_map")
      AND value NOT IN (SELECT "code" FROM "_country_code_map");

    IF unmapped IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot map to an ISO 3166-1 alpha-2 country code: %', unmapped;
    END IF;
END $$;

UPDATE "airport" a
SET "country" = m."code"
FROM "_country_code_map" m
WHERE m."name" = a."country";

UPDATE "user_stats_by_airport" s
SET "country" = m."code"
FROM "_country_code_map" m
WHERE m."name" = s."country";

ALTER TABLE "airport" ALTER COLUMN "country" SET DATA TYPE VARCHAR(2);
ALTER TABLE "user_stats_by_airport" ALTER COLUMN "country" SET DATA TYPE VARCHAR(2);

-- CreateTable
CREATE TABLE "user_country_visit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "flightId" UUID NOT NULL,
    "airportId" UUID NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_country_visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_country_visit_userId_flightId_key" ON "user_country_visit"("userId", "flightId");

-- CreateIndex
CREATE INDEX "user_country_visit_userId_country_idx" ON "user_country_visit"("userId", "country");

-- AddForeignKey
ALTER TABLE "user_country_visit" ADD CONSTRAINT "user_country_visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_country_visit" ADD CONSTRAINT "user_country_visit_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_country_visit" ADD CONSTRAINT "user_country_visit_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "airport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill one stamp per completed flight, at the airport it actually landed at.
INSERT INTO "user_country_visit" ("id", "userId", "country", "flightId", "airportId", "visitedAt")
SELECT gen_random_uuid(), f."captainId", a."country", f."id", a."id", f."completedAt"
FROM "flight" f
JOIN "airport" a ON a."id" = COALESCE(
    CASE WHEN f."isDiversionDeclared" THEN (
        SELECT d."airportId" FROM "flight_diversion" d WHERE d."flightId" = f."id"
    ) END,
    (
        SELECT af."airportId" FROM "airport_flight" af
        WHERE af."flightId" = f."id" AND af."airportType" = 'destination'
    )
)
WHERE f."completedAt" IS NOT NULL
  AND f."captainId" IS NOT NULL
ON CONFLICT ("userId", "flightId") DO NOTHING;

DROP TABLE "_country_code_map";
