ENGLISH VERSION (Norsk versjon av readme er tilljenglig nederst)
Required Packages

To run this project, the following packages must be installed:

express
sqlite3
body-parser
jsonwebtoken (JWT)
bcrypt
ejs
Installation Guide

Run the following commands in your terminal:

npm install express
npm install sqlite3
npm install body-parser
npm install jsonwebtoken
npm install bcrypt
npm install ejs
Design Choices and Solutions

I chose to hash passwords in the database to improve security. This ensures that even if someone manages to perform an SQL injection attack, they will not gain access to sensitive data such as plain-text passwords.

Additionally, I decided not to use an API key in this project. The functionality can be handled effectively using parameterized SQL queries, and there was no need for external authentication.

The application is built using Express with server-side rendering (EJS). This allows the web application to handle multiple users simultaneously by responding dynamically based on user IDs.

I aimed to design a simple and intuitive user interface so that the application can be used by anyone, regardless of technical experience.

SQLite was chosen as the database because I do not expect a high number of concurrent write operations. SQLite is also faster than MySQL (approximately 2–5 times faster) in low to moderate load scenarios.

Disclaimer

All visual elements, including CSS design, were generated using artificial intelligence.

Work in Progress (WIP)
Encryption of user notes and tasks to further protect sensitive information
Adding more comments in the code to make the project easier to understand for other developers and instructors

...............................NORSK VERSJON.......................................
Nødvendige pakker for å kjøre dette prosjektet

For å kjøre dette skriptet må følgende pakker være installert:

express
sqlite3
body-parser
jsonwebtoken (jwt)
bcrypt
ejs
Installasjonsguide

Kjør følgende kommando i terminalen:

npm install express
npm install sqlite3
npm install body-parser
npm install jsonwebtoken
npm install bcrypt
npm install ejs
Logiske valg og løsninger

Jeg har valgt å hashe passordene i databasen. Dette er gjort for å øke sikkerheten, slik at selv om noen skulle lykkes med SQL-injeksjon, vil de ikke få tilgang til sensitive data som passord i klartekst.

I tillegg har jeg valgt å ikke bruke API-nøkkel i dette prosjektet. Dette fordi funksjonaliteten enkelt kan løses med parameteriserte SQL-spørringer, og det var ikke behov for ekstern autentisering.

Jeg har brukt Express sammen med server-side rendering (EJS). Dette gjør at webapplikasjonen kan håndtere mange brukere samtidig gjennom forespørsler og svar basert på bruker-ID.

Jeg har forsøkt å gjøre brukergrensesnittet enkelt og intuitivt, slik at applikasjonen kan brukes av alle, uavhengig av teknisk erfaring.

Jeg har valgt SQLite som database fordi jeg ikke forventer mange samtidige skrivinger. SQLite er også raskere enn MySQL (ca. 2–5 ganger raskere) i scenarier med lav til moderat belastning.

Ansvarsfraskrivelse

Alle visuelle elementer, inkludert CSS-design, er produsert ved hjelp av kunstig intelligens.

Under utvikling (WIP)
Kryptering av brukerens notater og oppgaver for å beskytte sensitiv informasjon ytterligere
Flere kommentarer i koden for å gjøre prosjektet enklere å forstå for andre utviklere og lærer