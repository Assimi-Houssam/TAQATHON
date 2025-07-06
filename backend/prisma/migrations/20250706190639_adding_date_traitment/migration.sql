/*
  Warnings:

  - You are about to drop the column `closure_date` on the `anomaly` table. All the data in the column will be lost.

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
    "resolution_date" DATETIME,
    "date_traitement" DATETIME,
    "section_proprietaire" TEXT,
    "fiablite_integrite" TEXT,
    "fiablite_conf" TEXT,
    "disponsibilite" TEXT,
    "disponibilite_conf" TEXT,
    "process_safty" TEXT,
    "process_safty_conf" TEXT,
    "Criticite" TEXT,
    "status" TEXT,
    "trained" BOOLEAN,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maintenance_window_id" TEXT,
    CONSTRAINT "anomaly_maintenance_window_id_fkey" FOREIGN KEY ("maintenance_window_id") REFERENCES "maintenance_window" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_anomaly" ("Criticite", "created_at", "date_detection", "descreption_anomalie", "disponibilite_conf", "disponsibilite", "duree_intervention", "fiablite_conf", "fiablite_integrite", "id", "maintenance_window_id", "num_equipments", "origine", "process_safty", "process_safty_conf", "resolution_date", "section_proprietaire", "status", "systeme", "trained", "unite") SELECT "Criticite", "created_at", "date_detection", "descreption_anomalie", "disponibilite_conf", "disponsibilite", "duree_intervention", "fiablite_conf", "fiablite_integrite", "id", "maintenance_window_id", "num_equipments", "origine", "process_safty", "process_safty_conf", "resolution_date", "section_proprietaire", "status", "systeme", "trained", "unite" FROM "anomaly";
DROP TABLE "anomaly";
ALTER TABLE "new_anomaly" RENAME TO "anomaly";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
