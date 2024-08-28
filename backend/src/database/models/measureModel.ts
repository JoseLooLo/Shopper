import { PrismaClient, Measure } from '@prisma/client';

const prisma = new PrismaClient();

export interface MeasureFilterParams {
  measure_uuid?: string;
  image_url?: string;
  measure_value?: number;
  customer_code?: string;
  measure_type?: string;
  measure_datetime?: string;
  has_confirmed?: boolean
}

export async function getAllMeasures(): Promise<Measure[]> {
  const measures = await prisma.measure.findMany();
  return measures;
}

export async function getMeasuresByCustomer(customerCode: string): Promise<Measure[]> {
  const measures = await prisma.measure.findMany({
    where: {
      customer_code: customerCode,
    },
  });

  return measures;
}

export async function getMeasuresByUUID(uuid: string): Promise<Measure | null> {
  const measures = await prisma.measure.findUnique({
    where: {
      measure_uuid: uuid,
    },
  });

  return measures;
}

export async function confirmMeasureValueByUUID(uuid: string, value: number): Promise<Measure | null> {
  try {
    const updatedMeasure = await prisma.measure.update({
      where: {
        measure_uuid: uuid,
      },
      data: {
        measure_value: value,
        has_confirmed: true
      },
    });

    return updatedMeasure;
  } catch (error) {
    return null;
  }
}

export async function getFilteredMeasures(filters: MeasureFilterParams): Promise<Measure[]> {
  const measures = await prisma.measure.findMany({
    where: {
      ...(filters.measure_uuid && { measure_uuid: filters.measure_uuid }),
      ...(filters.image_url && { image_url: filters.image_url }),
      ...(filters.measure_value !== undefined && { measure_value: filters.measure_value }),
      ...(filters.customer_code && { customer_code: filters.customer_code }),
      ...(filters.measure_type && { measure_type: filters.measure_type }),
      ...(filters.measure_datetime && { measure_datetime: filters.measure_datetime }),
      ...(filters.has_confirmed && { has_confirmed: filters.has_confirmed }),
    },
  });

  return measures;
}