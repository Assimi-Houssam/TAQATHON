/*
  Warnings:

  - You are about to drop the `equipement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `atachments_id` on the `anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `equipement_id` on the `anomaly` table. All the data in the column will be lost.
  - You are about to drop the column `rex_id` on the `anomaly` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "equipement";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "action_plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "Action" TEXT,
    "responsable" TEXT,
    "pdrs_disponible" TEXT,
    "resource_intern" TEXT,
    "resource_extern" TEXT,
    "status" TEXT,
    "anomaly_id" TEXT,
    CONSTRAINT "action_plan_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "anomaly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenance_window" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date_debut_arret" DATETIME,
    "date_fin_arret" DATETIME,
    "duree_jour" TEXT,
    "duree_heure" TEXT,
    "type_maintenance" TEXT,
    "duree_maintenance" TEXT
);

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
    "Criticite" TEXT
);
INSERT INTO "new_anomaly" ("Criticite", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "section_proprietaire", "systeme", "unite") SELECT "Criticite", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "section_proprietaire", "systeme", "unite" FROM "anomaly";
DROP TABLE "anomaly";
ALTER TABLE "new_anomaly" RENAME TO "anomaly";
CREATE TABLE "new_rex_entrie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT,
    "docment_path" TEXT,
    "anomalies_id" TEXT,
    CONSTRAINT "rex_entrie_anomalies_id_fkey" FOREIGN KEY ("anomalies_id") REFERENCES "anomaly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rex_entrie" ("docment_path", "id", "summary") SELECT "docment_path", "id", "summary" FROM "rex_entrie";
DROP TABLE "rex_entrie";
ALTER TABLE "new_rex_entrie" RENAME TO "rex_entrie";
CREATE UNIQUE INDEX "rex_entrie_anomalies_id_key" ON "rex_entrie"("anomalies_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
