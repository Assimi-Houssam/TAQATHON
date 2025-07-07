/*
  Warnings:

  - You are about to alter the column `pdrs_disponible` on the `action_plan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_action_plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "Action" TEXT,
    "responsable" TEXT,
    "pdrs_disponible" BOOLEAN,
    "resource_intern" TEXT,
    "resource_extern" TEXT,
    "status" TEXT,
    "anomaly_id" TEXT,
    CONSTRAINT "action_plan_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "anomaly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_action_plan" ("Action", "anomaly_id", "id", "pdrs_disponible", "resource_extern", "resource_intern", "responsable", "status") SELECT "Action", "anomaly_id", "id", "pdrs_disponible", "resource_extern", "resource_intern", "responsable", "status" FROM "action_plan";
DROP TABLE "action_plan";
ALTER TABLE "new_action_plan" RENAME TO "action_plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
