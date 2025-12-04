/*
  Warnings:

  - You are about to alter the column `fecha_hora` on the `evidenciaot` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_creacion` on the `ordentrabajo` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_programada` on the `ordentrabajo` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_cierre` on the `ordentrabajo` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropForeignKey
ALTER TABLE `ordentrabajo` DROP FOREIGN KEY `OrdenTrabajo_id_creador_fkey`;

-- DropIndex
DROP INDEX `OrdenTrabajo_id_creador_fkey` ON `ordentrabajo`;

-- AlterTable
ALTER TABLE `evidenciaot` MODIFY `fecha_hora` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `ordentrabajo` MODIFY `fecha_creacion` DATETIME NOT NULL,
    MODIFY `fecha_programada` DATETIME NULL,
    MODIFY `fecha_cierre` DATETIME NULL,
    MODIFY `id_creador` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrdenTrabajo` ADD CONSTRAINT `OrdenTrabajo_id_creador_fkey` FOREIGN KEY (`id_creador`) REFERENCES `Usuario`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;
