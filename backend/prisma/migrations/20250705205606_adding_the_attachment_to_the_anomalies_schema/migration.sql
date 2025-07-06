-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "file_name" TEXT,
    "file_path" TEXT,
    "anomaly_id" TEXT,
    CONSTRAINT "attachments_anomaly_id_fkey" FOREIGN KEY ("anomaly_id") REFERENCES "anomaly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_attachments" ("file_name", "file_path", "id") SELECT "file_name", "file_path", "id" FROM "attachments";
DROP TABLE "attachments";
ALTER TABLE "new_attachments" RENAME TO "attachments";
CREATE UNIQUE INDEX "attachments_anomaly_id_key" ON "attachments"("anomaly_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
