-- CreateTable
CREATE TABLE `Measure` (
    `measure_uuid` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `measure_value` INTEGER NOT NULL,
    `customer_code` VARCHAR(191) NOT NULL,
    `measure_type` VARCHAR(191) NOT NULL,
    `measure_datetime` DATETIME(3) NOT NULL,
    `has_confirmed` BOOLEAN NOT NULL,

    PRIMARY KEY (`measure_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
