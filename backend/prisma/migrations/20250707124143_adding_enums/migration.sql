/*
  Warnings:

  - You are about to alter the column `required_stoping` on the `anomaly` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_anomaly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "required_stoping" BOOLEAN,
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
    "Criticite" INTEGER,
    "status" TEXT,
    "source" TEXT,
    "comment" TEXT,
    "trained" BOOLEAN,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maintenance_window_id" TEXT,
    CONSTRAINT "anomaly_maintenance_window_id_fkey" FOREIGN KEY ("maintenance_window_id") REFERENCES "maintenance_window" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_anomaly" ("Criticite", "comment", "created_at", "date_detection", "date_traitement", "descreption_anomalie", "disponibilite_conf", "disponsibilite", "duree_intervention", "fiablite_conf", "fiablite_integrite", "id", "maintenance_window_id", "num_equipments", "origine", "process_safty", "process_safty_conf", "required_stoping", "resolution_date", "section_proprietaire", "source", "status", "systeme", "trained", "unite") SELECT "Criticite", "comment", "created_at", "date_detection", "date_traitement", "descreption_anomalie", "disponibilite_conf", "disponsibilite", "duree_intervention", "fiablite_conf", "fiablite_integrite", "id", "maintenance_window_id", "num_equipments", "origine", "process_safty", "process_safty_conf", "required_stoping", "resolution_date", "section_proprietaire", "source", "status", "systeme", "trained", "unite" FROM "anomaly";
DROP TABLE "anomaly";
ALTER TABLE "new_anomaly" RENAME TO "anomaly";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
