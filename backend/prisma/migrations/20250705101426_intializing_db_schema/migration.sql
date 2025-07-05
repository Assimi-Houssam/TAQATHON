-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "anomaly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "num_equipments" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "equipement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "location" TEXT,
    "tag_number" TEXT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "file_name" TEXT,
    "file_path" TEXT
);

-- CreateTable
CREATE TABLE "rex_entrie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT,
    "docment_path" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "anomaly_equipement_id_key" ON "anomaly"("equipement_id");

-- CreateIndex
CREATE UNIQUE INDEX "anomaly_atachments_id_key" ON "anomaly"("atachments_id");

-- CreateIndex
CREATE UNIQUE INDEX "anomaly_rex_id_key" ON "anomaly"("rex_id");
