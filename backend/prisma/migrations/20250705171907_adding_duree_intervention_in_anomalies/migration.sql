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
    "equipement_id" TEXT,
    "atachments_id" TEXT,
    "rex_id" TEXT,
    CONSTRAINT "anomaly_equipement_id_fkey" FOREIGN KEY ("equipement_id") REFERENCES "equipement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "anomaly_atachments_id_fkey" FOREIGN KEY ("atachments_id") REFERENCES "attachments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "anomaly_rex_id_fkey" FOREIGN KEY ("rex_id") REFERENCES "rex_entrie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_anomaly" ("Criticite", "atachments_id", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "equipement_id", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "rex_id", "section_proprietaire", "systeme", "unite") SELECT "Criticite", "atachments_id", "date_detection", "descreption_anomalie", "disponsibilite", "duree_intervention", "equipement_id", "fiablite_integrite", "id", "num_equipments", "origine", "process_safty", "rex_id", "section_proprietaire", "systeme", "unite" FROM "anomaly";
DROP TABLE "anomaly";
ALTER TABLE "new_anomaly" RENAME TO "anomaly";
CREATE UNIQUE INDEX "anomaly_equipement_id_key" ON "anomaly"("equipement_id");
CREATE UNIQUE INDEX "anomaly_atachments_id_key" ON "anomaly"("atachments_id");
CREATE UNIQUE INDEX "anomaly_rex_id_key" ON "anomaly"("rex_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
