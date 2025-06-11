-- CreateTable
CREATE TABLE "DistributionStatement" (
    "id" SERIAL NOT NULL,
    "Marketing Owner" TEXT,
    "Nombre Distribucion" TEXT,
    "Projecto" TEXT,
    "Numero de Catalogo" TEXT,
    "UPC" TEXT,
    "Local Product Number" TEXT,
    "ISRC" TEXT,
    "Titulo catalogo" TEXT,
    "Mes Reportado" INTEGER,
    "Territorio" TEXT,
    "Codigo del Territorio" TEXT,
    "Nombre del Territorio" TEXT,
    "Tipo de Precio" TEXT,
    "Tipo de Ingreso" TEXT,
    "Venta" INTEGER,
    "RTL" DOUBLE PRECISION,
    "PPD" DOUBLE PRECISION,
    "RBP" DOUBLE PRECISION,
    "Tipo de Cambio:" DOUBLE PRECISION,
    "Valor Recibido" DOUBLE PRECISION,
    "Regalias Artisticas" INTEGER,
    "Costo Distribucion" DOUBLE PRECISION,
    "Copyright" INTEGER,
    "Cuota Administracion" INTEGER,
    "Costo Carga" INTEGER,
    "Otros Costos" INTEGER,
    "Ingresos Recibidos" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "DistributionStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DistributionStatement_userId_idx" ON "DistributionStatement"("userId");

-- CreateIndex
CREATE INDEX "DistributionStatement_teamId_idx" ON "DistributionStatement"("teamId");

-- AddForeignKey
ALTER TABLE "DistributionStatement" ADD CONSTRAINT "DistributionStatement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionStatement" ADD CONSTRAINT "DistributionStatement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
