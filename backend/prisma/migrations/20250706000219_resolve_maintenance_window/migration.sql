/*
  Warnings:

  - You are about to drop the column `duree_maintenance` on the `maintenance_window` table. All the data in the column will be lost.
  - You are about to drop the column `type_maintenance` on the `maintenance_window` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anomaly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "num_equipments" TEXT,
    "duree_intervention" TEXT,
    "unite" TEXT,
    "systeme" TEXT,
    "descreption_anomalie" TEXT,
    "date_detection" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origine" TEXT,
    "section_proprietaire" TEXT,
    "fiablite_integrite" TEXT,
    "disponsibilite" TEXT,
    "process_safty" TEXT,
    "Criticite" TEXT,
    "trained" BOOLEAN,
    "maintenance_window_id" TEXT,
    CONSTRAINT "anomaly_maintenance_window_id_fkey" FOREIGN KEY ("maintenance_window_id") REFERENCES "maintenance_window" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_anomaly" ("Criticite", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "section_proprietaire", "systeme", "trained", "unite") SELECT "Criticite", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "section_proprietaire", "systeme", "trained", "unite" FROM "anomaly";
DROP TABLE "anomaly";
ALTER TABLE "new_anomaly" RENAME TO "anomaly";
CREATE UNIQUE INDEX "anomaly_maintenance_window_id_key" ON "anomaly"("maintenance_window_id");
CREATE TABLE "new_maintenance_window" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_debut_arret" DATETIME,
    "date_fin_arret" DATETIME,
    "duree_jour" TEXT,
    "duree_heure" TEXT
);
INSERT INTO "new_maintenance_window" ("date_debut_arret", "date_fin_arret", "duree_heure", "duree_jour", "id") SELECT "date_debut_arret", "date_fin_arret", "duree_heure", "duree_jour", "id" FROM "maintenance_window";
DROP TABLE "maintenance_window";
ALTER TABLE "new_maintenance_window" RENAME TO "maintenance_window";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
